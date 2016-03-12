/*!
 * module dependencies
 */
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyHtml = require('gulp-minify-html');
var ngHtml2Js = require('gulp-ng-html2js');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var FOUNDATION = {
	deps: ['bower_components/tether/tether.js',
		'bower_components/foundation-apps/js/vendor/iconic.min.js'],
	iconic: 'bower_components/open-iconic/svg/*.svg',
	js: ['bower_components/foundation-apps/js/angular/common/*.js',
		'bower_components/foundation-apps/js/angular/directives/*.js'],
	partials: ['bower_components/foundation-apps/js/angular/partials/*.html']
};
/**
 * Foundation for Apps Build Tasks
 */
module.exports = function(PATHS) {
	gulp.task('foundation-iconic', function() {
		return gulp.src(FOUNDATION.iconic)
		.pipe(gulp.dest(PATHS.client.dist + '/vendor/svg'));
	});
	gulp.task('foundation-partials', function() {
		return gulp.src(FOUNDATION.partials)
		.pipe(minifyHtml({
			empty: true,
			comments: true
		}))
		.pipe(ngHtml2Js({
			moduleName: 'foundation',
			declareModule: false,
			prefix: 'partials/'
		}))
		.pipe(concat('foundation.partials.js'))
		.pipe(gulp.dest(PATHS.client.dist + '/vendor'));
	});
	gulp.task('foundation-js', ['foundation-partials'], function() {
		var dirs = FOUNDATION.deps.concat(FOUNDATION.js);
		/*PATHS.client.dist + '/vendor/foundation.partials.js');*/

		return gulp.src(dirs).pipe(concat('foundation.js'))
			.pipe(gulp.dest(PATHS.client.dist + '/vendor'))
			.pipe(rename('foundation.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(PATHS.client.dist + '/vendor'));
	});
	gulp.task('foundation', ['foundation-js', 'foundation-iconic'], function(cb) {
		var partials = PATHS.client.dist + '/vendor/foundation.partials.js';
		fs.unlink(path.resolve(__dirname, '..', partials), cb);
	});
};
