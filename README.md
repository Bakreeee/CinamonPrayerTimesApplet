# CinamonPrayerTimesApplet
A lightweight applet for cinnamon which is an automatic prayer time indicator. This applet loves in your panel, providing real time information about daily prayer timings based on current location. 

## Features
- Automatic location using the IP to determine the city and coordinates
- Next prayer through dynamic updates to show the name and time of the upcoming prayer
- Detailed dropdown through clicking the applet to see a full scedule
- Efficent updating through ensuring the applet only hits the API when necessary, saving system resourses and bandwidth


## How It Works
The applet intergrates 2 main services:
1. [IP-API](http://ip-api.com/) to locate the users city
2. Adhan API to fetch accuate prayer timings

## instalation 
1. Navigate the the Cinamon applets folder:
   ```cd ~/.local/share/cinnamon/applets```
3. Clone the repository
4. Enable the applet via Cinamon Applet Settings.
