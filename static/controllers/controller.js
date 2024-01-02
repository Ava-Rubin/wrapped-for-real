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



function getTopSongs(){

    $.ajax({
        type: 'GET',
        url: '/top_songs',
        success: function(response) {
            songChart(response);
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



function getDailyCounts(getMonth){

    var title;

    switch(getMonth) {
        case 1:
            title = 'JANUARY'
            break;
        case 2:
          // code block
            title = 'FEBRUARY'
            break;
        case 3:
        // code block
            title = 'MARCH'
            break;
        case 4:
            title = 'APRIL'
            break;
        case 5:
            // code block
            title = 'MAY'
            break;
        case 6:
        // code block
            title = 'JUNE'
            break;
        case 7:
            title = 'JULY'
            break;
        case 8:
          // code block
            title = 'AUGUST'
            break;
        case 9:
        // code block
            title = 'SEPTEMBER'
            break;
        case 10:
            title = 'OCTOBER'
            break;
        case 11:
            // code block
            title = 'NOVEMBER'
            break;
        case 12:
        // code block
            title = 'DECEMBER'
            break;
        default:
            title = 'NaN'
      }

    document.getElementById("month-title").innerHTML = title;
    $.ajax({
        type: 'GET',
        url: '/daily_time/' + encodeURIComponent(getMonth),
        success: function(response) {
            displayDailyCounts(response);
            monthlyChart(response);
        },
        error: function(error) {
            console.error('Error (daily counts):', error);
        }
    });
}

function nextMonth(){
    if(currMonth == 12){
        currMonth = 1;
    } else {
        currMonth++;
    }
    
    getDailyCounts(currMonth);
}

let currMonth = 0;

function firstMonth(){
    $.ajax({
        type: 'GET',
        url: '/first_month',
        success: function(response) {
            currMonth = parseInt(response.first_month);
            getDailyCounts(currMonth);
        },
        error: function(error) {
            console.error('Error (upload):', error);
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
            setTimeout(function(){
                const obj = document.getElementById("artist-counter");
                animateValue(obj, 0,response['artistCount'],3000);
            },500)
            setTimeout(function(){
                const obj = document.getElementById("song-counter");
                animateValue(obj, 0,response['totalSong'],3000);
            },4500)
            setTimeout(function(){
                const obj = document.getElementById("minute-counter");
                animateValue(obj, 0,response['totalMin'],3000);
            },8500)
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

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
  

function getTopArtists(){

    $.ajax({
        type: 'GET',
        url: '/top_artists',
        success: function(response) {
            displayTopArtists(response);
            artistChart(response);
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


function artistChart(results){
    var artistNames = [];
    var artistPlays = [];
    results.forEach(function (artist) {
        artistNames.push(artist['artistName']);
        artistPlays.push(parseInt(artist['count']));
        
    });

    var barColors = [
        "#90BA78",
        "#688F8E",
        "#577590",
        "#B36B82",
        "#D16161",
        "#D78A76",
        "#B77966",
        "#F08A4B",
        "#F2A541",
        "#F3CA40"
    ];

    new Chart("myChart", {
    type: "doughnut",
    data: {
        labels: artistNames,
        datasets: [{
            backgroundColor: barColors,
            data: artistPlays,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            },
        },
        legend: {
            position: 'right',
            display: true,
            labels: {
                fontFamily: "Cairo",
                fontColor: "#8B5241",
                fontStyle: "bold",
                fontSize: 32
            }
        },
        datasets: {
          doughnut: {
            borderColor: '#FAE9B2',
            borderWidth:10,
          },
        },
      }
  });

    
}

function songChart(results){
    var songNames = [];
    var songPlays = [];
    results.forEach(function (song) {
        songNames.push(song['trackName']);
        songPlays.push(parseInt(song['count']));
        
    });

    var barColors = [
        "#577590",
        "#688F8E",
        "#B77966",
        "#D16161",
        "#E8BBB0",
        "#B77966",
        "#F6C079",
        "#FAE9B2",
        "#688F8E",
        "#C8DCBC",
        "#577590",
        "#688F8E",
        "#B77966",
        "#D16161",
        "#E8BBB0",
        "#B77966",
        "#F6C079",
        "#FAE9B2",
        "#688F8E",
        "#C8DCBC",
    ];

    new Chart("mySongChart", {
    type: "horizontalBar",
    data: {
        labels: songNames,
        datasets: [{
            backgroundColor: barColors,
            data: songPlays,
        }]
    },
    options: {
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display:false
                },
                ticks: {
                    display: false, 
                }
            }],
            yAxes: [{
                
                gridLines: {
                    display:false
                },
                ticks: {
                    fontSize:20,
                    fontColor: "white",
                    fontFamily: "Cairo",
                    fontStyle: "bold"
                }

            }]
        }
      }
  });
}

function monthlyChart(results){
    var days = [];
    var plays = [];
    results.forEach(function (day) {
        days.push(day['endTime']);
        plays.push(parseInt(day['count']));
        
    });

    var barColors = [
        "#A95EBB",
        "#ED445C",
        "#F9734C",
        "#FF9636",
        "#FFAD18",
        "#EBC208",
        "#D4CA28",
        "#99DA5E",
        "#6EC89F",
        "#9483B1",
        "#A95EBB",
        "#ED445C",
        "#F9734C",
        "#FF9636",
        "#FFAD18",
        "#EBC208",
        "#D4CA28",
        "#99DA5E",
        "#6EC89F",
        "#9483B1",
        "#A95EBB",
        "#ED445C",
        "#F9734C",
        "#FF9636",
        "#FFAD18",
        "#EBC208",
        "#D4CA28",
        "#99DA5E",
        "#6EC89F",
        "#9483B1",
        "#6EC89F",
        "#9483B1",
        "#A95EBB",
        "#ED445C",
        "#F9734C",
        "#FF9636",
        "#FFAD18",
        "#EBC208",
        "#D4CA28",
        "#99DA5E",
        "#6EC89F",
        "#9483B1"
    ];

    // var barColors = [
    // "#FF6B00",
    // "#04E762",
    // "#FFBE00",
    // "#008BF8",
    // "#A933F2",
    // "#F23333",
    // "#DC00D3",
    // "#00FFD1",
    // "#00D1FF",
    // "#DC0073"
    // ];

    new Chart("monthlyChart", {
    type: "line",
    data: {
        labels:  days,
        datasets: [{
        pointBackgroundColor: barColors,
        fill: false,
        borderColor: 'white',
        borderWidth: 1,
        lineTension: 0,
        data: plays,
        }]
    },
    options: {
        legend: {
            display: false
        }
    }
     
  });

    
}
