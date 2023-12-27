from datetime import datetime
from flask import Flask, redirect, render_template, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
import csv
import os

from sqlalchemy import func

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///listening-data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class CSVData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    endTime = db.Column(db.Date, nullable=False)
    artistName = db.Column(db.String(255), nullable=False)
    trackName = db.Column(db.String(255), nullable=False)
    msPlayed = db.Column(db.String(255), nullable=False)

#Page Routes
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/getting-started", methods=['POST'])
def getting_started():
    return render_template("instructions.html")

@app.route("/display-stats", methods=['POST'])
def display_stats():
    return render_template("display-stats.html")

#API Routes
# @app.route('/upload', methods=['POST'])
# def upload():
#     data = request.form.get('csv_data')
#     csv_reader = csv.DictReader(data.splitlines())

#     for row in csv_reader:
#         listen_time = int(row['msPlayed'])

#         if listen_time >= 30000:
#             try:
#                 date_str = row['endTime']
#                 end_time = datetime.strptime(date_str, '%Y-%m-%d %H:%M')  # Adjust the format accordingly
#             except ValueError as e:
#                 print(f"Error parsing date {date_str}: {e}")
#                 continue  # Skip the current row if date parsing fails

#             new_data = CSVData(endTime=end_time, artistName=row['artistName'], trackName=row['trackName'], msPlayed=listen_time)
#             db.session.add(new_data)

#     db.session.commit()

#     return jsonify({'message': 'Data stored successfully'})
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

    # data = request.form.get('csv_data')
    # csv_reader = csv.DictReader(data.splitlines())

    # for row in csv_reader:
    #     listen_time = int(row['msPlayed'])

    #     if listen_time >= 30000:
    #         date_str = row['endTime']
    #         end_time = datetime.strptime(date_str, '%Y-%m-%d %H:%M')
    #         formatted_date = end_time.date()

    #         new_data = CSVData(endTime=formatted_date, artistName=row['artistName'], trackName=row['trackName'], msPlayed=row['msPlayed'])
    #         db.session.add(new_data)



    # db.session.commit()     
    # return jsonify({'message': 'File uploaded and data stored successfully'})

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
    # Use SQLAlchemy's func module to count occurrences and order by count in descending order
    artist_counts = db.session.query(CSVData.artistName, func.count().label('count')) \
        .group_by(CSVData.artistName) \
        .order_by(func.count().desc()) \
        .limit(10)\
        .all()

    # Convert the result to a dictionary for easier JSON serialization
    result = [{'artistName': row.artistName, 'count': row.count} for row in artist_counts]

    return jsonify(result)

@app.route('/top_songs', methods=['GET'])
def top_songs():
    # Use SQLAlchemy's func module to count occurrences and order by count in descending order
    song_counts = db.session.query(CSVData.trackName, func.count().label('count')) \
        .group_by(CSVData.trackName) \
        .order_by(func.count().desc()) \
        .limit(20)\
        .all()

    # Convert the result to a dictionary for easier JSON serialization
    result = [{'trackName': row.trackName, 'count': row.count} for row in song_counts]

    return jsonify(result)

@app.route('/daily_time', methods=['GET'])
def daily_time():
    
    daily_time = db.session.query(CSVData.endTime, func.count().label('count')) \
        .group_by(CSVData.endTime) \
        .all()

    # Convert the result to a dictionary for easier JSON serialization
    result = [{'endTime': row.endTime, 'count': row.count} for row in daily_time]

    return jsonify(result)
    
@app.route('/total_stats', methods=['GET'])
def total_stats():
    return jsonify(0)

if __name__ == '__main__':
    app.run(debug=True)