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

            SC.get('/users/2575422/playlists/free-angola', {
                useHTML5Audio: true,
                preferFlash: false
            }).then(function(playlist) {
                this.tracks = playlist.tracks;
                this.pubSub.publish("/app/events/soundcloud/loaded_tracks", { tracks: this.tracks });

                SC.stream('/users/2575422/tracks/25159425').then(function(player) {

                    this.player = player;

                    var arr = _.values(this.tracks);
                    var currentTrack = _.find(this.tracks, { id: 25159425 });

                    player.on('time', function() {
                        var p = this.songPercentage(currentTrack.duration, player.currentTime());
                        TweenLite.to(this.percentageBarSpan, 1.5, { css: { width: (p * 100 + "%") } });
                    }.bind(this));

                    player.on('start', function() {

                        this.percentageBarSpan.setAttribute('style', '');

                    }.bind(this));

                    player.on('finish', function() {

                        this.percentageBarSpan.setAttribute('style', '');

                    }.bind(this));


                }.bind(this));

            }.bind(this));

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

            this.setAnimationTimelines();

            this.btnPlay = document.querySelector('button.play');

        },

        setEventListeners: function() {

            this.pubSub.subscribe("/app/events/soundcloud/loaded_tracks", this.compileTemplates.bind(this));

            this.btnPlay.addEventListener("click", this.btnPlayerHandler.bind(this));

        },

        setAnimationTimelines: function() {

            /*
            this.timelinePercentageBar = new TimelineLite();

            this.timelinePercentageBar.to(this.percentageBarSpan, 3, { width: "100%" }, 0);

            this.timelinePercentageBar.pause();
            */

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

        },

        btnPlayerHandler: function(e) {

            this.player.play();

        }

    };

    window.freeAngola = new FreeAngola();

});
