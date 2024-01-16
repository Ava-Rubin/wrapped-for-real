# wrapped-for-real

https://avarubin.pythonanywhere.com/

This is a **work in progress** personal project that can be viewed at the link above. 
A couple of years ago I discovered that Spotify gave users the ability to download a JSON file of all their listening activity from the last year. I initially used Google's data visualizer to make sense of my data, but always wanted to create a project that used this data for a more detailed 'wrapped'. I started this project in December, and am still working on it. 

I originally planned to make it a static site, but quickly realized I needed a way to store and sort through the data. So, I started looking into SQL, and database management, and how to implement it. I ended up using SQLAlchemy, but realized I would also need a backend to connect and interact with my database. I decided to use Flask and Python--both of which I had very little experience with beforehand. Through various documentation and tutorials, I slowly started piecing everything together. Then came the issue of hosting--I could no longer host the site statically. I then discovered PythonAnywhere, and after reading their documentation, was able to successfuly get the site live, which now anyone can access!
