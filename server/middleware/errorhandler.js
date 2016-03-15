	/*!
 * mavis errorhandler
 * adapted from (errorhandler)[https://github.com/expressjs/errorhandler]
 */
/**
 * Module dependencies
 */
var accepts = require('accepts');
var logger  = log4js.getLogger('errorhandler.js');
/**
 * Constants
 */
var ENV = process.env.NODE_ENV || 'development';
/**
 * Error handler
 */
function errorHandler(err, req, res, next) {
	logger.info(err)
	// respect err.status; default status is 500.
	if (err.status) res.statusCode = err.status;
	console.log('#### ' + res.statusCode);
	if (res.statusCode < 400) res.statusCode = 500;
	// in case we've already responded.
	if (res._header) return req.socket.destroy();
	// force IE & Chrome to respect content type.
	res.setHeader('X-Content-Type-Options', 'nosniff');
	// content negotiation
	var accept = accepts(req);
	var type = accept.types('html', 'json', 'text');
	// only include a stack trace during development.
	var error = {
		message: err.message
	};
	for (var key in err) {
		error[key] = err[key];
	}
	if (ENV == 'development') error.stack = err.stack || '';
	else delete error.stack;
	// if (ENV == 'development') console.error(error);
	// render an html error page.
	if (type == 'html') {
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		return res.render('' + res.statusCode, {
			error: error
		}, function(err, html) {
			if (err) {
				err.status = 500;
				return errorHandler(err, req, res, next);
			}
			res.send(html);
		});
	}
	// send the json error.
	if (type == 'json') {
		res.setHeader('Content-Type', 'application/json');
		return res.json({
			error: error
		});
	}
	// send a simple error message.
	if (type == 'text') {
		res.setHeader('Content-Type', 'text/plain');
		return res.send(error.message);
	}
}

module.exports = errorHandler;
