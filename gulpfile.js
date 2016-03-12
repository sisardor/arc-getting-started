/*!
 * module dependencies
 */
var gulp = require('gulp');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var spawn = require('child_process').spawn;
var configPath = './mavis-config.' + process.env.NODE_ENV + '.yml';
var config = require('yamljs').load(configPath);
var server;
/**
 * Paths
 * =====
 */
var PATHS = {
	server: {
		js: [/*'gulpfile.js', 'gulp/*.js',*/ 'server/**/*.js', 'common/**/*.js'],
		json: 'common/models/*.json',
		// test: {
		// 	unit: ['test/**/*.js'],
		// 	e2e: 'test/e2e/*.js'
		// }
	},
	client: {
		app: 'client/app/index.js',
		dist: 'client/dist',
		images: 'client/img/*.*',
		js: 'client/app/**/*.js',
		sass: ['client/sass/**/*.scss', 'client/app/**/*.scss'],
		templates: 'client/app/**/*.html',
		views: 'client/*.html',
		test: {
			unit: 'client/test/*.js',
			e2e: 'client/test/e2e/*.js'
		}
	},
	karma: []
};
/**
 * --------
 * QA Tasks
 * ========
 */
require('./gulp/qa')(PATHS);
/**
 * -----------
 * Build Tasks
 * ===========
 */
// require('./gulp/build-foundation')(PATHS);
// require('./gulp/build')(PATHS);
/**
 * -----------------
 * Development Tasks
 * =================
 */


// Run Server
gulp.task('server', function() {
	if (server) server.kill();
	server = spawn('node', ['server/server.js'], {
		stdio: 'inherit'
	});
	server.on('close', function(code) {
		if (code != 143) {
			gutil.log('Node server stopped with code: ' + code);
			gutil.log('The server will restart when you change a file.');
		}
	});
});
// Watch
gulp.task('watch', [], function() {
	livereload.listen({
		auto: true
	});
	gulp.watch(PATHS.server.js, [ 'server']);
	gulp.watch(PATHS.server.json, ['server']);
});
// Default
gulp.task('default', ['server', 'watch']);
/**
 * ------------
 * Deploy Tasks
 * ============
 */
/*!
 * no zombie servers!
 */
process.on('exit', function() {
	if (server) server.kill();
	if (livereload.server) livereload.server.close();
});
