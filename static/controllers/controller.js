function upload() {
    var formData = new FormData($('#uploadForm')[0]);

    $.ajax({
        type: 'POST',
        url: '/upload',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            alert(response.message);
        },
        error: function(error) {
            console.error('Error (upload):', error);
        }
    });
}

function search() {
    var query = $('#searchQuery').val();

    $.ajax({
        type: 'POST',
        url: '/search',
        data: { query: query },
        success: function(response) {
            displayResults(response.results);
        },
        error: function(error) {
            console.error('Error (search):', error);
        }
    });
}

function displayResults(results) {
    var resultContainer = $('#searchResults');
    resultContainer.empty();

    if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            resultContainer.append('<p>Song: ' + results[i].trackName + ', Artist: ' + results[i].artistName + '</p>');
        }
    } else {
        resultContainer.append('<p>No results found.</p>');
    }
}

function getTopArtists(){

    $.ajax({
        type: 'GET',
        url: '/top_artists',
        success: function(response) {
            displayTopArtists(response);
        },
        error: function(error) {
            console.error('Error (top artists):', error);
        }
    });
}

function displayTopArtists(results) {
    var topArtistsList = $('#topArtistsList');
    topArtistsList.empty();  // Clear existing list

    results.forEach(function (artist) {
        var listItem = $('<li>').text(artist['artistName'] + ' - ' + artist['count'] + ' plays');
        topArtistsList.append(listItem);
    });
}

function getTopSongs(){

    $.ajax({
        type: 'GET',
        url: '/top_songs',
        success: function(response) {
            displayTopSongs(response);
        },
        error: function(error) {
            console.error('Error (top songs):', error);
        }
    });
}

function displayTopSongs(results) {
    var topSongsList = $('#topSongsList');
    topSongsList.empty();  // Clear existing list

    results.forEach(function (song) {
        var listItem = $('<li>').text(song['trackName'] + ' - ' + song['count'] + ' plays');
        topSongsList.append(listItem);
    });
}

function getDailyCounts(){

    $.ajax({
        type: 'GET',
        url: '/daily_time',
        success: function(response) {
            displayDailyCounts(response);
        },
        error: function(error) {
            console.error('Error (daily counts):', error);
        }
    });
}

function displayDailyCounts(results) {
    var dailyCountsList = $('#dailyCounts');
    dailyCountsList.empty();  // Clear existing list

    results.forEach(function (day) {
        var listItem = $('<li>').text(day['endTime'] + ' - ' + day['count'] + ' plays');
        dailyCountsList.append(listItem);
    });
}

function getTotals(){

    $.ajax({
        type: 'GET',
        url: '/total_stats',
        success: function(response) {
            displayTotals(response);
        },
        error: function(error) {
            console.error('Error (totals):', error);
        }
    });
}

function displayTotals(results) {
    var totals = $('#totals');
    totals.empty();  // Clear existing list
    
    var listItem = $('<li>').text(results['artistCount'] + ' - ' + results['songCount'] + ' - ' + results['totalSong']+ ' - ' + results['totalMin']);
    totals.append(listItem);
    
}

function getMonthlyArtists(){

    $.ajax({
        type: 'GET',
        url: '/monthly_artists',
        success: function(response) {
            displayMonthlyArtists(response);
        },
        error: function(error) {
            console.error('Error (totals):', error);
        }
    });
}

function displayMonthlyArtists(data) {
    for (var i = 0; i < data.length; i++) {
        var monthlyArtistDiv = $('<div class="monthlyArtists">');
        monthlyArtistDiv.append('<p>Month: ' + data[i].month + '</p>');
        monthlyArtistDiv.append('<p>Year: ' + data[i].year + '</p>');
        monthlyArtistDiv.append('<p>Artist Name: ' + data[i].artistName + '</p>');
        monthlyArtistDiv.append('<p>Count: ' + data[i].count + '</p>');
        $('#monthlyArtists').append(monthlyArtistDiv);
    }
    
}

function getMonthlySongs(){

    $.ajax({
        type: 'GET',
        url: '/monthly_songs',
        success: function(response) {
            displayMonthlySongs(response);
        },
        error: function(error) {
            console.error('Error (songs):', error);
        }
    });
}

function displayMonthlySongs(data) {
    for (var i = 0; i < data.length; i++) {
        var monthlySongDiv = $('<div class="monthlySongs">');
        monthlySongDiv.append('<p>Month: ' + data[i].month + '</p>');
        monthlySongDiv.append('<p>Year: ' + data[i].year + '</p>');
        monthlySongDiv.append('<p>Song Name: ' + data[i].trackName + '</p>');
        monthlySongDiv.append('<p>Count: ' + data[i].count + '</p>');
        $('#monthlySongs').append(monthlySongDiv);
    }
    
}