console.log('app.js');

window.addEventListener("load", function() {

    function FreeAngola() {

        this.init();
        this.setProperties();

    }

    FreeAngola.prototype = {

        init: function() {

            console.log('init fn()');

            this.setProperties();

        },

        setProperties: function() {

            console.log('setProperties fn()');

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
