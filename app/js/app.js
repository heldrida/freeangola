console.log('app.js');

/*
    Get users ID:

        https://api.soundcloud.com/resolve?url=https%3A//soundcloud.com/userName&client_id=YOUR_CLIENT_ID
        heldrida is 2575422
 */

window.addEventListener("load", function() {

    function FreeAngola() {

        this.init();
        this.setProperties();

    }

    FreeAngola.prototype = {

        init: function() {

            console.log('init fn()');

            this.setProperties();

            this.initSC();

            this.setEventListeners();

        },

        initSC: function() {

            SC.initialize({
                client_id: this.SC_APP_CLIENT_ID,
                redirect_uri: ''
            });

            SC.get('/users/2575422/playlists/free-angola').then(function(playlist) {
                this.tracks = playlist.tracks;
                this.pubSub.publish("/app/events/soundcloud/loaded_tracks", { tracks: this.tracks });
            }.bind(this));


            var t = _.find(this.tracks, function(t) {
                return t.id === 25159425;
            });

            SC.stream('/users/2575422/tracks/25159425').then(function(player) {

                player.play();

                player.on('time', function() {
                    var x = this.songPercentage(t.duration, player.currentTime());
                    console.log('x', x);

                    this.percentageBarSpan.style.width = (x * 100) + "%";

                }.bind(this));

            });

        },

        setProperties: function() {

            console.log('setProperties fn()');

            this.pubSub = PubSub;

            this.SC_USER_ID = 2575422;

            this.SC_APP_CLIENT_ID = "995ae17ff20ba9d16401a3b94dd1faa1";

            this.songListUl = document.querySelector('.song-list');

            this.player = null;

            this.percentageBar = document.querySelector('.percentage-bar');
            this.percentageBarSpan = this.percentageBar.querySelector('span');

        },

        setEventListeners: function() {

            this.pubSub.subscribe("/app/events/soundcloud/loaded_tracks", this.compileTemplates.bind(this));

        },

        compileTemplates: function(params) {

            this.compileSongList(params.tracks);

        },

        compileSongList: function(tracks) {

            console.log(tracks);

            var data = {
                songs: [{
                    poster: "img/temp/album-cover-01.jpg?201602191749",
                    title: "Song title",
                    artist: "Artist name"
                }, {
                    poster: "img/temp/album-cover-02.jpg?201602191749",
                    title: "Song title",
                    artist: "Artist name"
                }, {
                    poster: "img/temp/album-cover-03.jpg?201602191749",
                    title: "Song title",
                    artist: "Artist name"
                }, {
                    poster: "img/temp/album-cover-04.jpg?201602191749",
                    title: "Song title",
                    artist: "Artist name"
                }, {
                    poster: "img/temp/album-cover-05.jpg?201602191749",
                    title: "Song title",
                    artist: "Artist name"
                }, {
                    poster: "img/temp/album-cover-06.jpg?201602191749",
                    title: "Song title",
                    artist: "Artist name"
                }]
            };

            // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
            var tmpl = document.querySelector("#tmpl-song-list-item").innerHTML;
            var compiled = _.template(tmpl);

            var c = compiled(data);

            this.songListUl.innerHTML = c;

        },

        songPercentage: function(totalDuration, currentTime) {

            if (_.isNil(totalDuration) || _.isNil(currentTime)) {
                return null;
            }

            return 1 - ((totalDuration - currentTime) / totalDuration);

        }

    };

    window.freeAngola = new FreeAngola();

});
