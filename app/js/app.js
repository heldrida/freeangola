console.log('app.js');

/*
    Get users ID:

        https://api.soundcloud.com/resolve?url=https%3A//soundcloud.com/userName&client_id=YOUR_CLIENT_ID
        heldrida is 2575422
 */

function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

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

            this.freeAngolaContainer = document.querySelector('.freeangola');

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

            this.songTitle = this.freeAngolaContainer.querySelector('.song-title');
            this.songTitleTxt = this.songTitle.querySelector('.txt');
            this.songTitleTracker = this.songTitle.querySelector('.tracker');

            this.menu = this.freeAngolaContainer.querySelector('.menu');

            this.mandrillApiKey = 'ZFO7i1rj1Ourlt964x5jJQ';

            this.form = document.querySelector('form[name="newAudioTrack"]');

            this.formInputFileCollection = this.form.querySelectorAll('div.file input[type="text"]');

            this.tracksLoadedEvCalled = false;

            this.termsConditionsCheckbox = this.form.querySelector('.usr-terms label');

            this.threeDots;

            this.closeCollapse;

            this.mobileCloseBtn = document.querySelector(".mobile-close-btn");

            this.sidebar = document.querySelector(".sidebar");

            this.spinner = document.querySelector(".spinner");

            // prevent spam
            var mailAddress = "NOSPMSPMSPMinfo@freeangola.comNOSPMSPMSPM";
            mailAddress = mailAddress.split("NOSPMSPMSPM");
            this.mailTo = document.querySelector(".mailto");
            this.mailTo.setAttribute("href", "mailto:" + mailAddress[1]);
            this.mailTo.text = mailAddress[1];

            this.vinyl = document.querySelector(".vinyl");

            this.tlVinyl = new TimelineMax({ repeat: -1 });
            this.tlVinyl.to(this.vinyl, 1.2, { rotation: "360", transformOrigin: "50% 50%", ease: Linear.easeNone });
            this.tlVinyl.stop();

            this.baseURL = location.hostname.indexOf("localhost") > -1 || location.hostname.indexOf("magnolia") > -1 ? "http://localhost:8888/freeangola/app/" : "";

            this.floatingLogo = document.querySelector('.floating-logo');

        },

        setEventListeners: function() {

            // wait till the tracks are available
            this.pubSub.subscribe("/app/events/soundcloud/loaded_tracks", function(playlist) {

                if (this.tracksLoadedEvCalled) {
                    return null;
                } else {
                    this.tracksLoadedEvCalled = true;
                }

                this.compileTemplates.call(this, { playlist: playlist });

                console.log("playlist", playlist);

                this.scPlayer.on('ended', this.btnNextHandler.bind(this));

                this.scPlayer.on('ended', function() {
                    console.log('ended!');
                });

                this.scPlayer.on('play', this.playCallHandler.bind(this));

                this.scPlayer.on('pause', function() {
                    this.tlVinyl.stop();
                }.bind(this));

                // set property
                this.songListUlLi = this.songListUl.querySelectorAll('li');

                _.forEach(this.songListUlLi, function(v, k) {
                    this.songListUlLi[k].addEventListener('click', this.trackListItemClickHandler.bind(this));

                }.bind(this));

                // set property
                this.threeDots = document.querySelectorAll(".three-dots");
                _.forEach(this.threeDots, function(v, k) {
                    this.threeDots[k].addEventListener("click", this.threeDotsHandler.bind(this));
                }.bind(this));

                // set property
                this.closeCollapse = document.querySelectorAll(".close.collapse");
                _.forEach(this.closeCollapse, function(v, k) {
                    this.closeCollapse[k].addEventListener("click", this.closeCollapseHandler.bind(this));
                }.bind(this));

                // set initial tracker info
                this.updateTracker(0);

                // if browser allows it, play first track
                if (Modernizr.autoplay) {
                    setTimeout(function() {
                        this.scPlayer.play();
                        this.pubSub.publish("/app/events/soundcloud/click", "play");
                    }.bind(this), 300);
                }

                this.injectFbSdk();

            }.bind(this));

            this.btnPlay.addEventListener("click", this.btnPlayHandler.bind(this));
            this.btnNext.addEventListener("click", this.btnNextHandler.bind(this));
            this.btnPrevious.addEventListener("click", this.btnPreviousHandler.bind(this));

            this.pubSub.subscribe("/app/events/soundcloud/click", this.scEventHandler.bind(this));

            window.requestAnimationFrame(this.rafStep.bind(this));

            this.menu.addEventListener('click', this.btnMenuClickHandler.bind(this));

            this.form.addEventListener('submit', this.formSubmitHandler.bind(this));

            _.forEach(this.formInputFileCollection, function(v, k) {
                this.formInputFileCollection[k].addEventListener("click", this.formFileHandler.bind(this));
            }.bind(this));

            this.pubSub.subscribe("/app/events/soundcloud/upload_finished", this.uploadFinishedHandler.bind(this));

            this.form.song_title.addEventListener("keyup", this.validateForm.bind(this));

            this.termsConditionsCheckbox.addEventListener("click", this.termsConditionsCheckboxHandler.bind(this));

            this.columnRight = document.querySelector(".column-r");

            this.mobileCloseBtn.addEventListener("click", this.mobileCloseBtnHandler.bind(this));

            this.uploadSuccessMsg = document.querySelector(".upload-success-message");

            window.addEventListener("scroll", this.scrollHandler.bind(this));

            this.floatingLogo.addEventListener("click", function (e) {

            	this.menu.click();

            }.bind(this));

        },

        scrollHandler: function (e) {

        	if (window.innerWidth > 1024) {
        		return null;
        	}

        	if (window.pageYOffset > 50) {
        		TweenLite.to(this.floatingLogo, 0.3, { css: { opacity: 1, y: 0, ease: Back. easeOut.config( 1.7) }, onStart: function () {
        				this.floatingLogo.style.display = "block";
        			}.bind(this)
        		});
        	} else {
        		TweenLite.to(this.floatingLogo, 0.3, { css: { opacity: 0, y: 100, ease: Back. easeOut.config( 1.7) }, onComplete: function () {
        				this.floatingLogo.style.display = "none";
        			}.bind(this)
        		});
        	}

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

        splitTitleData: function(title) {

            var titleData = title.split("|");

            if (titleData.length == 2) {
                strTitle = titleData[1];
                strArtist = titleData[0];
            } else {
                strTitle = titleData[0];
                strArtist = "Anónimo";
            }

            return {
                title: strTitle,
                artist: strArtist
            };

        },

        compileSongList: function(tracks) {

            var data = _.map(tracks, function(track) {

                var titleData = this.splitTitleData(track.title);

                return {
                    poster: track.artwork_url,
                    title: titleData["title"],
                    artist: titleData["artist"],
                    waveform: track.waveform_url
                };
            }.bind(this));

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
            } else if (param === "play") {
                this.percentageBarSpan.style.width = (0 + "%");
                if (this.scPlayer.playing) {
                    this.btnPlay.setAttribute('data-status', 'play');
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

        setPlayNextPrevControllerVsibility: function() {

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

        rafStep: function() {

            this.scTimeUpdateHandler.call(this);
            window.requestAnimationFrame(this.rafStep.bind(this));

        },

        playCallHandler: function() {

            // reset first
            _.forEach(this.songListUlLi, function(li) {
                li.classList.remove('active');
            });

            this.songListUlLi[this.scPlayer._playlistIndex].classList.add('active');

            this.setCurrentSongMetadata();

            this.tlVinyl.play();


        },

        setCurrentSongMetadata: function() {

            var track = this.scPlayer._playlist.tracks[this.scPlayer._playlistIndex ? this.scPlayer._playlistIndex : 0];

            var titleData = this.splitTitleData(track.title);
            console.log("titleData", titleData);
            console.log("<" + titleData["artist"] + "> " + titleData["title"]);
            this.songTitleTxt.innerHTML = "[" + titleData["artist"] + "] " + titleData["title"];

            this.updateTracker(this.scPlayer._playlistIndex + 1);

        },

        updateTracker: function(n) {

            var n = !n ? 0 : n;

            if (this.scPlayer._playlist && this.scPlayer._playlist.track_count) {
                this.songTitleTracker.innerHTML = n + " / " + this.scPlayer._playlist.track_count;
            }

        },

        btnMenuClickHandler: function(e) {

            e ? e.preventDefault() : null;

            if (!this.freeAngolaContainer.classList.contains('menu-open')) {
                this.freeAngolaContainer.classList.add('menu-open');
                this.columnRight.style.width = "49.999%"; // fix issue chrome
            } else {
                this.freeAngolaContainer.classList.remove('menu-open');
                this.columnRight.style.width = "";
            }

        },

        trackListItemClickHandler: function(e) {

            e.preventDefault();

            var currentTarget = findAncestor(e.target, "row");
            var parent = findAncestor(currentTarget, "ul-song-list");

            var index = [].indexOf.call(parent.children, currentTarget);

            this.scPlayer.play({ playlistIndex: index });
            this.pubSub.publish("/app/events/soundcloud/click", "play");

        },

        likeBtnClickHandler: function(e) {
            e.preventDefault();
            e.stopPropagation();
            alert("todo: share on facebook");
        },

        formSubmitHandler: function(e) {

            e.preventDefault();

            this.callAjax(this.baseURL + "/auth/request_token.php", this.sendFile.bind(this));

        },


        sendFile: function(data) {

            // show spinner
            this.form.style.display = "none";
            this.spinner.style.display = "block";

            data = JSON.parse(data);

            // http://stackoverflow.com/questions/7034358/upload-into-my-soundcloud-account-using-my-web-form-and-api
            // https://recalll.co/app/?q=php%20-%20How%20to%20get%20access%20token%20for%20one%20Soundcloud%20account

            // https://github.com/njasm/soundcloud

            SC.initialize({
                oauth_token: data.access_token,
                client_id: this.SC_APP_CLIENT_ID,
                redirect_uri: 'http://dev.freeangola.com/callback.html'
            });

            console.log("this.form.audio.files[0]", this.form.audio.files[0]);
            console.log("this.form.poster.files[0]", this.form.poster.files[0]);

            var upload = SC.upload({
                asset_data: this.form.audio.files[0],
                title: this.setTitle(this.form),
                artwork_data: this.form.poster.files[0] ? this.form.poster.files[0] : ""
            });

            upload.request.addEventListener('progress', function(e) {
                console.log("upload in progress!");
            }.bind(this));

            upload.then(function(track) {
                this.pubSub.publish("/app/events/soundcloud/upload_finished", track.permalink_url);
            }.bind(this));

        },

        setTitle: function(form) {

            var artist = form.artist.value;
            var song_title = form.song_title.value;

            return artist + "|" + song_title;

        },

        callAjax: function(url, callback) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    callback(xmlhttp.responseText);
                }
            };

            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        },

        formFileHandler: function(e) {
            //https://www.new-bamboo.co.uk/blog/2012/01/10/ridiculously-simple-ajax-uploads-with-formdata/
            //
            e.preventDefault();

            var inputFile = e.target.parentNode.querySelector("input[type=\"file\"]");
            var inputTxt = e.target.parentNode.querySelector("input[type=\"text\"]");

            console.log("e.target", e.target);
            console.log("inputFile", inputFile);
            console.log("inputTxt", inputTxt);

            inputFile.addEventListener("change", function() {

                if (inputFile.files[0].type !== "audio/mp3") {
                    console.log("not mp3 file");
                } else {
                    inputTxt.innerHTML = inputFile.files[0].name;
                }
                inputTxt.value = inputFile.files[0].name;
                this.validateForm();
            }.bind(this));

            inputFile.click();

        },

        uploadFinishedHandler: function(permalink_url) {

            console.log("permalink_url", permalink_url);

            // reset
            this.form.reset();
            this.form.classList.remove("valid");
            this.form.submit.setAttribute("style", "");
            this.termsConditionsCheckbox.classList.remove('checked');

            this.form.style.display = "none";

            TweenLite.to(this.uploadSuccessMsg, 0.3, {
                css: { opacity: 1 },
                onStart: function() {
                    this.spinner.style.display = "";
                    this.uploadSuccessMsg.style.display = "block";
                    var sidebar = document.querySelector(".sidebar");
                    sidebar.scrollTop = sidebar.scrollHeight;
                }.bind(this)
            });

            setTimeout(function() {

                TweenLite.to(this.uploadSuccessMsg, 0.3, {
                    css: { opacity: 0 },
                    onComplete: function() {
                        this.uploadSuccessMsg.style.display = "";
                        this.form.style.display = "";
                        var sidebar = document.querySelector(".sidebar");
                        sidebar.scrollTop = sidebar.scrollHeight;
                    }.bind(this)
                });

            }.bind(this), 8000);

        },

        validateForm: function() {

            console.log("this.form.terms_and_conditions.checked", this.form.terms_and_conditions.checked);
            console.log("this.form.song_title.value.length", this.form.song_title.value.length);
            console.log("this.form.audio.files", this.form.audio.files);
            console.log("this.form.audio.files.length", this.form.audio.files.length);
            console.log('_.indexOf(["audio/mp3", "audio/mpeg"], this.form.audio.files[0].type)', _.indexOf(["audio/mp3", "audio/mpeg"], this.form.audio.files[0].type));

            if (this.form.terms_and_conditions.checked && this.form.song_title.value.length > 0 && this.form.audio.files && this.form.audio.files.length === 1 && _.indexOf(["audio/mp3", "audio/mpeg"], this.form.audio.files[0].type) > -1) {
                this.form.classList.add("valid");
                TweenLite.to(this.form.submit, 0.3, {
                    css: { opacity: 1 },
                    onStart: function() {

                        this.form.submit.style.opacity = 0;
                        this.form.submit.style.display = "block";

                    }.bind(this)
                });

            } else {

                this.form.classList.remove("valid");
                TweenLite.to(this.form.submit, 0.3, {
                    css: { opacity: 0 },
                    onComplete: function() {

                        this.form.submit.style.opacity = "";
                        this.form.submit.style.display = "";

                    }.bind(this)
                });

            }

        },

        termsConditionsCheckboxHandler: function(e) {
            e.stopPropagation();
            e.preventDefault();

            if (!this.termsConditionsCheckbox.classList.contains('checked')) {
                this.termsConditionsCheckbox.classList.add('checked');
                this.form.terms_and_conditions.checked = true;
            } else {
                this.termsConditionsCheckbox.classList.remove('checked');
                this.form.terms_and_conditions.checked = false;
            }

            this.validateForm();

        },

        threeDotsHandler: function(e) {

            e.preventDefault();
            e.stopPropagation();

            var parent = findAncestor(e.target, "row");

            if (!parent) {
                return null;
            }

            var songDataColR = parent.querySelector(".song-data .col-r");
            var songOptions = parent.querySelector(".song-opts");

            var tl = new TimelineLite({
                onStart: function() {
                    songOptions.classList.add("active");
                }.bind(this),
                onComplete: function() {

                }.bind(this)
            });

            tl.to(songDataColR, 0.2, { css: { opacity: 0 } }, 0);

        },

        injectFbSdk: function() {

            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s);
                js.async = true;
                js.id = id;
                js.src = "//connect.facebook.net/pt_PT/sdk.js#xfbml=1&version=v2.5&appId=1365519160254676";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

        },

        closeCollapseHandler: function(e) {

            e.preventDefault();
            e.stopPropagation();

            var parent = findAncestor(e.target, "row");

            if (!parent) {
                return null;
            }

            var songDataColR = parent.querySelector(".song-data .col-r");
            var songOptions = parent.querySelector(".song-opts");

            var tl = new TimelineLite({
                onStart: function() {

                }.bind(this),
                onComplete: function() {
                    songOptions.classList.remove("active");
                }.bind(this)
            });

            tl.to(songDataColR, 0.2, { css: { opacity: 1 } }, 0);


        },

        mobileCloseBtnHandler: function() {

            this.btnMenuClickHandler();

        }

    };

    window.freeAngola = new FreeAngola();

});
