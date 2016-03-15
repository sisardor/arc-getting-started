var log4js 		= require('log4js');
var logger 		= log4js.getLogger('cors-middleware.js');

module.exports = function customCorsHandler(req, res, next) {
	// logger.info('hit')
	// logger.info(req.method)
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Credentials', true);
		res.header('Access-Control-Allow-Origin', req.headers.origin);//'http://localhost:3003');
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	    next();
	}
	else {
		next()
	}

}

