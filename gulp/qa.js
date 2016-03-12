/*jshint trailing: true */
/* global process */
/*!
 * module dependencies
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var karma = require('gulp-karma');
var jslint = require('gulp-jslint');
var babel = require("gulp-babel");
/**
 * QA Tasks
 */
module.exports = function(PATHS) {
	gulp.task('server-lint2', function() {
		return gulp.src(['common/models/task.js'])
		// pass your directives
		// as an object
		.pipe(jslint({
			// these directives can
			// be found in the official
			// JSLint documentation.
			node: true,
			evil: true,
			nomen: true,
			// you can also set global
			// declarations for all source
			// files like so:
			global: ['console'],
			predef: [],
			// both ways will achieve the
			// same result; predef will be
			// given priority because it is
			// promoted by JSLint
			// pass in your prefered
			// reporter like so:
			reporter: 'default',
			// ^ there's no need to tell gulp-jslint
			// to use the default reporter. If there is
			// no reporter specified, gulp-jslint will use
			// its own.
			// specifiy custom jslint edition
			// by default, the latest edition will
			// be used
			edition: '2014-07-08',
			// specify whether or not
			// to show 'PASS' messages
			// for built-in reporter
			errorsOnly: false
		}))
		// error handling:
		// to handle on error, simply
		// bind yourself to the error event
		// of the stream, and use the only
		// argument as the error object
		// (error instanceof Error)
		.on('error', function(error) {
			console.error(String(error));
		});
	});
	/**
	 * Server Lint
	 */
	gulp.task('server-lint', function() {

		return gulp.src(PATHS.server.js)
			.pipe(jshint({	node: true }))
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(jscs());
	});


	/**
	 * Lint All The Things
	 */
	gulp.task('lint', ['server-lint']);

	/**
	 * Server Unit Tests
	 */
	gulp.task('server-unit-test', function() {

		return testWithMocha(PATHS.server.test.unit);
	});
	/**
	 * Server End-to-End Tests
	 */
	gulp.task('server-e2e-test', function() {
		return testWithMocha(PATHS.server.test.e2e);
	});

	function testWithMocha(src) {
		var env = process.env.NODE_ENV;
		process.env.NODE_ENV = 'test';
		console.log('************************')
		return gulp
				.src(src)
				.pipe(babel())
				.pipe(mocha({
					reporter: 'spec'
				})).once('end', function() {
					process.env.NODE_ENV = env;
				});
	}
	/**
	 * Test the Server
	 */
	gulp.task('server-test', ['server-unit-test', 'server-e2e-test']);
	/**
	 * Watch & Test the Server
	 */
	gulp.task('server-test-watch', function() {
		//gulp.watch(PATHS.server.js, ['server-unit-test', 'server-e2e-test']);
		gulp.watch(PATHS.server.test.unit, ['server-unit-test']);
		gulp.watch(PATHS.server.test.e2e, ['server-e2e-test']);
	});


	/**
	 * Test all the Things
	 */
	gulp.task('test', ['server-test']);
	/**
	 * Watch & Test all the Things
	 */
	gulp.task('test-watch', ['server-test-watch']);
};
