/* jslint node: true,  white: true, unparam: true */
/* jshint unused: true, node: true */
'use strict'

module.exports = function (Task) {
  // Validators
  Task.validatesInclusionOf('status',
    {
      'in': [
        'waiting',
        'ready',
        'in progress',
        'in review',
        'not approved',
        'approved'
      ]
    }
  )
}
