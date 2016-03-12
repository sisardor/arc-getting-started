/* jshint unused: true, node: true */

'use strict'

var debug = require('debug')('mavis:models:entity-type')
var constants = require('../helpers/constants')

module.exports = function (EntityType) {
  EntityType.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance) {
      debug('created EntityType#%s now add default fields', ctx.instance.id)
      // CommonField has been create in boot process
      EntityType.app.models.CommonField.find()
        .then((commonFields) => {
          debug('commonField %j', commonFields)

          for (var i = 0; i < commonFields.length; i++) {
            ctx.instance.commonFields.add(commonFields[i])
          }
          ctx.instance.__data.commonFields = commonFields
          next()
        })
        .catch(next)
    } else {
      // TODO: ctx.instance may not exist
      debug('updated EntityType#%s now add default fields', ctx.instance.id)
      next()
    }
  })

  // Validators
  EntityType.validatesInclusionOf(
    constants.CONSTANT_CATEGORY, {
      'in': [	constants.ENTITY_TYPE_ASSETS,
        constants.ENTITY_TYPE_GROUPS,
        constants.ENTITY_TYPE_TASKS,
        constants.ENTITY_TYPE_PROJECTS
      ]
    })
}
