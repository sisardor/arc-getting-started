var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:CommonField')

module.exports = function (app) {
  var CommonField = app.models.CommonField

  CommonField.create(constants.CONSTANT_COMMON_FIELDS, (err, fields) => {
    if (err) {
      logger.error('Provisioning ERROR `CommonField`:', err)
      return //cb(err)
    }

    debug('Created `CommonField`:')
    //process.nextTick(cb)
  })
}
