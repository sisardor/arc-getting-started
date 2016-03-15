var logger  = log4js.getLogger('my-error-handler.js');

module.exports = function(options) {
	// console.log(options);
	return function myErrorHandler(err, req, res, next) {
		logger.debug(err)
		if(err) {
			return next(err)
		}
		next();
	}
};
