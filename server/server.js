var _portRedis = 6379, _HostRedis   = 'localhost'
var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path')
var logger = require('tracer').colorConsole()
var app = module.exports = loopback();
console.log('****** isWorker')
process.title = 'node worker ' + process.pid

require('./server-logger')
require('./server-env')()
process.umask(0)

logger.info('%s is running in `%s`', process.title, process.env.NODE_ENV)
logger.info('%s is set to umask `%s`', process.title, process.umask())

// Static variables
var STATIC = path.resolve(__dirname, '../client/')

app.use(loopback.logger('tiny'));

// Set up the /favicon.ico
app.use(loopback.favicon(path.join(STATIC, 'favicon.ico')))


app.set('env', process.env.NODE_ENV || 'development')
app.set('version', require('../package.json').version)

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set('views', path.resolve(__dirname, '../client'))

app.locals.ENV = app.get('env')
app.locals.VERSION = app.get('version')

app.use(loopback.compress())
app.use(loopback.context())
app.use(loopback.token())


app.use(function (req, res, next) {

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
})

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
app.use(loopback.static(STATIC))

// app.use(require('./settings/current-user')(app))

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

var bootOptions = {
  'appRootDir': __dirname,
  'bootScripts' : [
    './samples/users.js',
    './samples/commonfields.js',
    './samples/entitytypes.js',
    './samples/customfields.js',
    './samples/fieldsets.js'
  ]
};
boot(app, bootOptions, function(err) {
  if (err) throw err;

  //start the server if `$ node server.js`
  if (require.main === module) {
    app.start()
  }
})
// User ACL setting
app.models.User.settings.acls = require('./user-acls.json')
