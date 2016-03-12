var configPath = './mavis-config.' + process.env.NODE_ENV + '.yml'
var config = require('yamljs').load(configPath)
var logger = require('tracer').colorConsole()
var fs = require('fs')

function setVariables() {
  global._$MAVIS_CONFIG = {}

  for (var key in config) {
    var prop = config[key]

    // Parse ENV variables.
    if (prop.indexOf('$') === 0) {
      var envName = prop.substring(1, prop.length)
      var envValue = process.env[envName] || '__ENV_VAR_NOT_SET__'

      logger.info('Parsing ENV variable: ' + prop)
      prop = envValue
    }
    // Check paths.
    if (key.indexOf('path') >= 0) {
      try {
        var result = fs.statSync(prop)
      } catch (e) {
        logger.error(e)
        process.exit(1)
      }
    }

    // Set global config as props on _$MAVIS_CONFIG
    global._$MAVIS_CONFIG[key] = prop
  }

  logger.info('_$MAVIS_CONFIG:')
  for (var key2 in global._$MAVIS_CONFIG) {
    logger.info('\t%s : %s', key2, global._$MAVIS_CONFIG[key])
  }
}

module.exports = setVariables