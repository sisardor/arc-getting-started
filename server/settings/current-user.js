var logger = require('tracer').colorConsole()
var loopback = require('loopback')

module.exports = function(app) {
  return function (req, res, next) {
    if (!req.accessToken) { return next(); }
    logger.info('setting current-user middleware')
    app.models.User.findById(req.accessToken.userId, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(new Error('No user with this access token was found.'));
      }
      res.locals.currentUser = user
      var loopbackContext = loopback.getCurrentContext()
      if (loopbackContext) { loopbackContext.set('currentUser', user); }
      next()
    })
  }
}


