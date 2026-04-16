//imports
const Applet = imports.ui.applet;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;

//initialises global http session for the applet
const _httpSession = new Soup.SessionAsync();

//constructor
function MyApplet(orientation, panel_height, instance_id) {
    this._init(orientation, panel_height, instance_id);
}

MyApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,
//initialisation logic
    _init: function (orientation, panel_height, instance_id) {
        //calls the parent constructure
        Applet.TextIconApplet.prototype._init.call(this, orientation, panel_height, instance_id);
        //sets initial visual state in the panel
        this.set_applet_icon_name("calendar-check-symbolic");
        this.set_applet_label("Loading...");
        //sets the dropdown menu
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        this._lastUpdateDate = "";
        //starts the background update loop
        this._updateLoop();


    },

    //function to convert time string into a javascript object
    _parsePrayerTime:function(timeStr){
        let [hours,minutes]=timeStr.split(':')
        let date=new Date();
        date.setHours(parseInt(hours),parseInt(minutes),0,0);
        return date;
    },

    //function to get the next prayer time
    _getNextPrayer: function (timings){
        let now=new Date()
        let prayers=["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

        for (let p of prayers){
            if (this._parsePrayerTime(timings[p])>now){
                return{ name:p, timeStyle:timings[p]};
            }
        }
        return {name: "Fajr",time:timings["Fajr"]}
    },

    //main loop to triger updates
    _updateLoop: function () {
        let now = new Date();
        let today = now.toLocaleDateString();

        //only hits API if the date has changed to save bandwidth
        if (this._lastUpdateDate !== today) {
            this._getLocationAndTimes();
        }
        //runs to check every hour
        Mainloop.timeout_add(3600000, Lang.bind(this, this._updateLoop));
    },

    //function to get the users location
    _getLocationAndTimes: function () {
        let url = "http://ip-api.com/json";
        let message = Soup.Message.new("GET", url);
        _httpSession.queue_message(message, Lang.bind(this, function (session, msg) {
            if (msg.status_code === 200) {
                let loc = JSON.parse(msg.response_body.data);
                this._fetchPrayerTimes(loc.lat, loc.lon, loc.city);
            }
        }));
    },

    //uses the Aladhan API to get the prayer time
    _fetchPrayerTimes: function (lat, lon, city) {
        let url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
        let message = Soup.Message.new("GET", url);

        _httpSession.queue_message(message, Lang.bind(this, function (session, msg) {
            if (msg.status_code === 200) {
                let data = JSON.parse(msg.response_body.data).data;
                this._displayTimes(data.timings, city);
                this._lastUpdateDate = new Date().toLocaleDateString();
            }
        }));
    },

    //updates the UI
    _displayTimes: function (timings, city) {
        this.menu.removeAll(); //removes all menu items
        let next=this._getNextPrayer(timings)

        this.set_applet_label(`${next.name}: ${next.time}`); //updates panel label
        this.set_applet_tooltip(`Prayer times for ${city}`);
        //defines which times we want to show in the drop down
        let prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

        //creates new menu item for each prayer
        prayers.forEach((p) => {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(`${p}: ${timings[p]}`));
        });
    },
    //logic when applet is toggled
    on_applet_clicked: function () {
        this.menu.toggle();
    }
};
//main method
function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(orientation, panel_height, instance_id);
}