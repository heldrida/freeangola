/**
 * gulp
 * $ npm install gulp gulp-livereload gulp-watch gulp-sass gulp-rename gulp-plumber --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber');

// Sass
gulp.task('sass', function () {
    return gulp.src('stylesheets/**/*.scss')
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
		server: {
			baseDir: "./app",
			routes: {
				"/bower_components": "./bower_components"
			}
		}
	});

});