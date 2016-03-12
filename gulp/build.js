/*!
 * module dependencies
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var ngAnnotate = require('gulp-ng-annotate');
var ngHtml2Js = require('gulp-ng-html2js');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var sassDeps = require('./gulp-sass-deps');
var bundler;
/**
 * Build Tasks
 */
module.exports = function(PATHS) {
	/**
	 * Images
	 */
	gulp.task('images', function() {
		return gulp.src(PATHS.client.images)
			.pipe(gulp.dest(PATHS.client.dist + '/img'))
			.pipe(livereload({
			auto: false
		}));
	});
	/**
	 * Sass
	 */
	gulp.task('sass', function() {
		return gulp.src(PATHS.client.sass).pipe(sassDeps({
			// this prevents gulp.watch from calling this task twice.
			maintainEntryFile: false
		})).pipe(sass({
			includePaths: ['bower_components/foundation-apps/scss',
							'bower_components/font-awesome/scss'],
			outputStyle: 'nested',
			errLogToConsole: true
		})).pipe(gulp.dest(PATHS.client.dist + '/css')).pipe(livereload({
			auto: false
		})).pipe(concat('app.min.css'))
			.pipe(minifyCss())
			.pipe(gulp.dest(PATHS.client.dist + '/css'));
	});
	/**
	 * HTML Templates
	 */
	gulp.task('templates', function() {
		return gulp.src(PATHS.client.templates).pipe(minifyHtml({
			empty: true,
			comments: true
		})).pipe(ngHtml2Js({
			moduleName: 'mavis',
			declareModule: false
		})).pipe(concat('templates.js'))
			.pipe(gulp.dest(PATHS.client.dist + '/app'))
			.pipe(livereload({auto: false}))
			.pipe(rename('templates.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(PATHS.client.dist + '/app'));
	});
	/**
	 * Browserify (with watching via Watchify & minification via Uglify).
	 */
	gulp.task('browserify-bundler', function() {
		bundler = browserify('./' + PATHS.client.app);
	});
	gulp.task('browserify', ['browserify-bundler'], function() {
		return rebundle();
	});
	gulp.task('watchify-bundler', function() {
		bundler = watchify(browserify('./' + PATHS.client.app, watchify.args));
	});
	gulp.task('watchify', ['watchify-bundler'], function() {
		bundler.on('update', rebundle);
	});

	function rebundle() {
		return bundler.bundle().on('error', function(err) {
			gutil.log('browserify error:', err.message);
		}).pipe(source('bundle.js')).pipe(buffer())
		// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		.pipe(ngAnnotate({
			add: true,
			single_quote: true
		}))
		// jscs:enable
		.pipe(gulp.dest(PATHS.client.dist + '/app')).pipe(livereload({
			auto: false
		}))
		.pipe(rename('bundle.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(PATHS.client.dist + '/app'));
	}
	/**
	 * Build
	 */
	gulp.task('build', ['images', 'sass', 'templates', 'browserify', 'foundation']);
};
