/* jslint node: true,  white: true, unparam: true */
/* jshint unused: true, node: true */
'use strict'
var constants = require('../helpers/constants')

module.exports = function (Field) {
  // Validators
  Field.validatesInclusionOf('type',
    {
      'in': [
        constants.CONST_STRING,
        constants.CONST_SELECT,
        constants.CONST_BOOLEAN,
        constants.CONST_NUMBER,
        constants.CONST_DATE,
        constants.CONST_JSON,
        'Sequence',
        'Entity',
        'file'
      ]
    }
  )

  Field.validatesInclusionOf('strict',
    {
      'in': [
        true,
        false,
        'add'
      ]
    }
  )
}
