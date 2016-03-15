var logger 		= log4js.getLogger('file-upload.js');

module.exports = function(req, res, next) {
	logger.debug('hello world from "file uploads" route');
	next();
}
