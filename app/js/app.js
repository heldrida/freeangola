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

            this.setEventListeners();

	        this.setPlayNextPrevControllerVsibility();

        },

        setProperties: function() {

            console.log('setProperties fn()');

            this.pubSub = PubSub;

            this.songListUl = document.querySelector('.song-list');
            this.songListUlLi = null;

            this.percentageBar = document.querySelector('.percentage-bar');
            this.percentageBarSpan = this.percentageBar.querySelector('span');

            this.setAnimationTimelines();

            this.btnPlay = document.querySelector('button.play');
            this.btnNext = document.querySelector('button.next');
            this.btnPrevious = document.querySelector('button.previous');

            this.SC_USER_ID = 2575422;

            this.SC_APP_CLIENT_ID = "995ae17ff20ba9d16401a3b94dd1faa1";

            this.scPlayer = new SoundCloudAudio(this.SC_APP_CLIENT_ID);

            this.scPlayer.resolve('http://soundcloud.com/heldrida/sets/free-angola', function(playlist) {

                this.scPlaylist = playlist;
                this.pubSub.publish("/app/events/soundcloud/loaded_tracks", playlist);

            }.bind(this));

            this.playControllersCommonOpacity = 0.5;

        },

        setEventListeners: function() {

            // wait till the tracks are available
            this.pubSub.subscribe("/app/events/soundcloud/loaded_tracks", function(playlist) {

                this.compileTemplates.call(this, { playlist: playlist });

                this.scPlayer.on('ended', this.btnNextHandler.bind(this));

                this.scPlayer.on('ended', function () {
                	console.log('ended!');
                });

                this.scPlayer.on('play', function () {

                	// reset first
                	_.forEach(this.songListUlLi, function (li) {
                		li.classList.remove('active');
                	});

					this.songListUlLi[this.scPlayer._playlistIndex].classList.add('active');
                }.bind(this));

                // set property
                this.songListUlLi = this.songListUl.querySelectorAll('li');

            }.bind(this));

            this.btnPlay.addEventListener("click", this.btnPlayHandler.bind(this));
            this.btnNext.addEventListener("click", this.btnNextHandler.bind(this));
            this.btnPrevious.addEventListener("click", this.btnPreviousHandler.bind(this));

            this.pubSub.subscribe("/app/events/soundcloud/click", this.scEventHandler.bind(this));

            window.requestAnimationFrame(this.rafStep.bind(this));

        },

        setAnimationTimelines: function() {

            /*
            this.timelinePercentageBar = new TimelineLite();

            this.timelinePercentageBar.to(this.percentageBarSpan, 3, { width: "100%" }, 0);

            this.timelinePercentageBar.pause();
            */

        },

        compileTemplates: function(params) {

            this.compileSongList(params.playlist.tracks);

        },

        compileSongList: function(tracks) {

            var data = _.map(tracks, function(track) {
                return {
                    poster: track.artwork_url,
                    title: track.title,
                    artist: "Artist name",
                    waveform: track.waveform_url
                };
            });

            console.log(data);

            // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
            var tmpl = document.querySelector("#tmpl-song-list-item").innerHTML;
            var compiled = _.template(tmpl);

            var c = compiled({ tracks: data });

            this.songListUl.innerHTML = c;

        },

        songPercentage: function(totalDuration, currentTime) {

            if (_.isNil(totalDuration) || _.isNil(currentTime)) {
                return null;
            }

            return 1 - ((totalDuration - currentTime) / totalDuration);

        },

        btnPlayHandler: function(e) {

            this.pubSub.publish("/app/events/soundcloud/click", "play");

            var status = this.btnPlay.getAttribute('data-status');

            if (status.toLowerCase() === "stop") {

                // change state
                this.btnPlay.setAttribute('data-status', 'play');

                this.scPlayer.play();

            } else if (status.toLowerCase() === "pause") {

                // change state
                this.btnPlay.setAttribute('data-status', 'play');

                this.scPlayer.play({
                	playlistIndex: this.scPlayer._playlistIndex
                });

            } else {

                // change state
                this.btnPlay.setAttribute('data-status', 'pause');

                this.scPlayer.pause();

            }

        },

        btnNextHandler: function() {

            this.pubSub.publish("/app/events/soundcloud/click", "next");

            this.scPlayer.next();

        },

        btnPreviousHandler: function() {

            this.pubSub.publish("/app/events/soundcloud/click", "previous");

            this.scPlayer.previous();

        },

        scEventHandler: function(param) {

        	console.log(param);

            // reset bar if any play next or previous options selected
            if (_.indexOf(["next", "previous"], param) > -1) {
                //TweenLite.set(this.percentageBarSpan, { css: { width: "0%" } });
				this.percentageBarSpan.style.width = (0 + "%");

                // ensure that the button attribute is set correctly
                // depending on the next/previous transition playing status
                if (this.scPlayer.playing) {
                	this.btnPlay.setAttribute('data-status', 'play');
                } else {
					this.btnPlay.setAttribute('data-status', 'stop');
                }
            }

            this.setPlayNextPrevControllerVsibility();

        },

        scTimeUpdateHandler: function() {
            var currentTime = this.scPlayer.audio.currentTime;
            var duration = this.scPlayer.audio.duration;
            var p = this.songPercentage(duration, currentTime);
        	this.percentageBarSpan.style.width = (p * 100 + "%");
        },

        setPlayNextPrevControllerVsibility: function () {

        	if (!this.scPlayer._playlistIndex) {
        		TweenLite.to(this.btnPrevious, 0.2, { css: { opacity: this.playControllersCommonOpacity } });
        		return null;
        	}

            // hide button next if current index equals or bigger then length of tracks
            if (this.scPlayer._playlistIndex >= this.scPlayer._playlist.tracks.length - 1) {
            	TweenLite.to(this.btnNext, 0.2, { css: { opacity: this.playControllersCommonOpacity } });
            } else {
            	TweenLite.to(this.btnNext, 0.2, { css: { opacity: 1 } });
            }

            // hide button previous if current index is first
            if (!this.scPlayer._playlistIndex || this.scPlayer._playlistIndex === 0) {
            	TweenLite.to(this.btnPrevious, 0.2, { css: { opacity: this.playControllersCommonOpacity } });
            } else {
            	TweenLite.to(this.btnPrevious, 0.2, { css: { opacity: 1 } });
            }

        },

        rafStep: function () {

        	this.scTimeUpdateHandler.call(this);
        	window.requestAnimationFrame(this.rafStep.bind(this));

        }

    };

    window.freeAngola = new FreeAngola();

});
