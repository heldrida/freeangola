/**
 * gulp
 * $ npm install gulp gulp-browsersync gulp-watch gulp-sass gulp-rename gulp-plumber --save-dev
 */

// Load plugins
var gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber');

// Sass
gulp.task('sass', function () {
    return gulp.src('./src/sass/main.scss')
           .pipe(plumber())
           .pipe(sass())
           .pipe(gulp.dest('./app/css'));
});

// Watch
gulp.task('watch', function () {

	gulp.watch('./src/sass/**/*.scss', ['sass']);
	gulp.watch('./app/css/*.css', ['reload']);
	gulp.watch("./app/index.html", ['reload']);
	gulp.watch("./app/js/**/*.js", ['reload']);

});

gulp.task('reload', function () {
	browserSync.reload();
});


gulp.task('serve', ['watch'], function () {

	browserSync.init({
		notify: false,
		server: {
			baseDir: "./app",
			routes: {
				"/bower_components": "./bower_components"
			}
		}
	});

});