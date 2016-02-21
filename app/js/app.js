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

        },

        initSC: function() {

            SC.initialize({
                client_id: this.SC_APP_CLIENT_ID,
                redirect_uri: ''
            });

            SC.get('/users/2575422/tracks').then(function(tracks) {
                this.tracks = tracks;
            }.bind(this));

        },

        setProperties: function() {

            console.log('setProperties fn()');

            this.SC_USER_ID = 2575422;

            this.SC_APP_CLIENT_ID = "995ae17ff20ba9d16401a3b94dd1faa1";

            this.songListUl = document.querySelector('.song-list');

            this.compileTemplates();

        },

        compileTemplates: function() {

            this.compileSongList();

        },

        compileSongList: function() {

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

        }

    };

    window.freeAngola = new FreeAngola();

});
