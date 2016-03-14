var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:CommonField')

module.exports = function (app) {
  var CommonField = app.models.CommonField

  CommonField.create(constants.CONSTANT_COMMON_FIELDS)
    .then(fields => {
      debug('Created `CommonField`: `%j`', fields)
    })
    .catch(err => {
      logger.error('Provisioning ERROR `CommonField`:', err)
    })
}
