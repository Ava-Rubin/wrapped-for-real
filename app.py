from datetime import datetime
import select
from flask import Flask, redirect, render_template, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
import csv
import os

from sqlalchemy import distinct, extract, func

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///listening-data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class CSVData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    endTime = db.Column(db.Date, nullable=False)
    artistName = db.Column(db.String(255), nullable=False)
    trackName = db.Column(db.String(255), nullable=False)
    msPlayed = db.Column(db.Integer, nullable=False)

#Page Routes
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/getting-started", methods=['POST'])
def getting_started():
    with app.app_context():
        db.drop_all()
        db.create_all()
    return render_template("instructions.html")

@app.route("/display-stats", methods=['POST'])
def display_stats():
    return render_template("display-stats.html")

@app.route("/overview", methods=['POST'])
def overview():
    return render_template("overview.html")

@app.route("/artists", methods=['POST'])
def artists():
    return render_template("top-artists.html")

@app.route("/songs", methods=['POST'])
def songs():
    return render_template("top-songs.html")

@app.route("/monthly", methods=['POST'])
def monthly():
    return render_template("monthly-review.html")

#API Routes
@app.route("/upload", methods=['POST'])
def upload():
    with app.app_context():
        db.drop_all()
        db.create_all()
    
    file = request.files['file']
    
    if file and file.filename.endswith('.csv'):

        csv_data = file.read().decode('utf-8')

        csv_reader = csv.DictReader(csv_data.splitlines())
 
        for row in csv_reader:
            listen_time = int(row['msPlayed'])

            if listen_time >= 30000:
                date_str = row['endTime']
                end_time = datetime.strptime(date_str, '%Y-%m-%d %H:%M')
                formatted_date = end_time.date()

                new_data = CSVData(endTime=formatted_date, artistName=row['artistName'], trackName=row['trackName'], msPlayed=row['msPlayed'])
                db.session.add(new_data)

        
        
        db.session.commit()
       

        return jsonify({'message': 'File uploaded and data stored successfully'})

    return jsonify({'message': 'Invalid file format'})


@app.route('/first_month', methods=['GET'])
def first_month():
    first_row = CSVData.query.order_by(CSVData.endTime).first()
    first_month = func.extract('month', first_row.endTime).label('first_month')
    result = CSVData.query.add_columns(first_month).first()
        
    return jsonify({'first_month': result.first_month})


@app.route('/search', methods=['POST'])
def search():
    query = request.form.get('query', '')
    
    # Perform a basic search in the database
    results = CSVData.query.filter(
        (CSVData.artistName.ilike(f'%{query}%'))
    ).all()

    result_data = [{'artistName': result.artistName, 'trackName': result.trackName} for result in results]

    return jsonify({'results': result_data})


@app.route('/top_artists', methods=['GET'])
def top_artists():
    artist_counts = db.session.query(CSVData.artistName, func.count().label('count')) \
        .group_by(CSVData.artistName) \
        .order_by(func.count().desc()) \
        .limit(10)\
        .all()

    result = [{'artistName': row.artistName, 'count': row.count} for row in artist_counts]
    #TODO: get total time for each
    return jsonify(result)

@app.route('/top_songs', methods=['GET'])
def top_songs():
    song_counts = db.session.query(CSVData.trackName, func.count().label('count')) \
        .group_by(CSVData.trackName) \
        .order_by(func.count().desc()) \
        .limit(20)\
        .all()

    result = [{'trackName': row.trackName, 'count': row.count} for row in song_counts]
    #TODO: get total time for each
    return jsonify(result)

@app.route('/daily_time/<int:month>', methods=['GET'])
def daily_time(month):

    daily_time = db.session.query(CSVData.endTime, func.count().label('count')) \
        .filter(func.extract('month', CSVData.endTime) == month) \
        .group_by(CSVData.endTime) \
        .all()

    # Convert the result to a dictionary for easier JSON serialization
    result = [{'endTime': row.endTime, 'count': row.count} for row in daily_time]

    return jsonify(result)
    
@app.route('/total_stats', methods=['GET'])
def total_stats():
    #Artists, Unique Songs, total songs, Total Time
    unique_artists_count = db.session.query(func.count(distinct(CSVData.artistName))).scalar()
    unique_songs_count = db.session.query(func.count(distinct(CSVData.trackName))).scalar()
    total_songs_count = db.session.query(func.count(CSVData.trackName)).scalar()
    total_ms_played = db.session.query(func.sum(CSVData.msPlayed)).scalar()

    #total_min = total_ms_played / 60000;
    total_min = round(total_ms_played/60000,0)

    # if(unique_artists_count > 1000):
    #    # unique_artists_count /= 1000
    #     unique_artists_count = round(unique_artists_count/1000,1)
    # if(unique_songs_count > 1000):
    #   #  unique_songs_count /= 1000
    #     unique_songs_count = round(unique_songs_count/1000,1)
    # if(total_songs_count > 1000):
    #    # total_songs_count /= 1000
    #     total_songs_count = round(total_songs_count/1000,1)

    result = {'artistCount': unique_artists_count, 'songCount': unique_songs_count,'totalSong': total_songs_count, 'totalMin': total_min}
    return jsonify(result)


@app.route('/monthly_artists', methods=['GET'])
def monthly_artists():
    #query through data, each time month changes make a new list
    # artist_counts = db.session.query(CSVData.artistName, func.count().label('count')) \
    #     .group_by(CSVData.artistName) \
    #     .order_by(func.count().desc()) \
    #     .limit(3)\
    #     .all()

    # result = [{'trackName': row.trackName, 'count': row.count} for row in artist_counts]
    
    # return jsonify(result)
    # monthly_artist_counts = db.session.query(
    # extract('month', CSVData.endTime).label('month'),
    # CSVData.artistName,
    # func.count().label('count')
    # ) \
    # .group_by('month', CSVData.artistName) \
    # .order_by('month', func.count().desc()) \
    # .all()

    # result = []

    # for row in monthly_artist_counts:
    #     # Convert the month integer to a string if needed
    #     month_str = str(row.month)

    #     # Append the result as a list of lists
    #     result.append({
    #         'month': month_str,
    #         'artistName': row.artistName,
    #         'count': row.count
    #     })

    # return jsonify(result)

    cte = db.session.query(
        extract('year', CSVData.endTime).label('year'),
        extract('month', CSVData.endTime).label('month'),
        CSVData.artistName,
        func.count().label('count')
    ) \
    .group_by('year', 'month', CSVData.artistName) \
    .order_by('year', 'month', func.count().desc()) \
    .cte('monthly_counts')

    monthly_artist_counts = db.session.query(
        cte.c.year,
        cte.c.month,
        cte.c.artistName,
        cte.c.count
    ) \
    .group_by(cte.c.year, cte.c.month) \
    .all()

    result = []

    for row in monthly_artist_counts:
    # Convert the month and year integers to strings if needed
        month_str = str(row.month)
        year_str = str(row.year)

        # Append the result as a list of dictionaries
        result.append({
            'year': year_str,
            'month': month_str,
            'artistName': row.artistName,
            'count': row.count
        })

    return jsonify(result)

@app.route('/monthly_songs', methods=['GET'])
def monthly_songs():
    cte = db.session.query(
        extract('year', CSVData.endTime).label('year'),
        extract('month', CSVData.endTime).label('month'),
        CSVData.trackName,
        func.count().label('count')
    ) \
    .group_by('year', 'month', CSVData.trackName) \
    .order_by('year', 'month', func.count().desc()) \
    .cte('monthly_counts')

    monthly_songs_counts = db.session.query(
        cte.c.year,
        cte.c.month,
        cte.c.trackName,
        cte.c.count
    ) \
    .group_by(cte.c.year, cte.c.month) \
    .all()

    result = []

    for row in monthly_songs_counts:
    # Convert the month and year integers to strings if needed
        month_str = str(row.month)
        year_str = str(row.year)

        # Append the result as a list of dictionaries
        result.append({
            'year': year_str,
            'month': month_str,
            'trackName': row.trackName,
            'count': row.count
        })

    return jsonify(result)



if __name__ == '__main__':
    app.run(debug=True)