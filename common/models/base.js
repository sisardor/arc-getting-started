/* jslint node: true,  white: true, unparam: true */
// /* global log4js */
/* jshint unused: true, node: true */
'use strict'
var loopback = require('loopback')
// var util = require('../helpers/util')

module.exports = function (Base) {
  // Computed Defaults.
  Base.definition.rawProperties.createdAt.default =
    Base.definition.properties.createdAt.default = function () {
      return new Date()
    }

  Base.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) { // HTTP POST
      // do something if you need
    } else { // HTTP PUT
      if (ctx.data) {
        ctx.data.updatedAt = new Date()
      } else {
        ctx.instance.updatedAt = new Date()
      }
    }
    next()
  })

  Base.observe('before save', function (ctx, next) {
    if (!loopback.getCurrentContext()) return next()
    var currentUser = loopback.getCurrentContext().get('currentUser')

    if (!currentUser) {
      var error = new Error('Authorization Required')
      error.statusCode = error.status = 401
      error.code = 'AUTHORIZATION_REQUIRED'
      return next(error)
    }

    if (ctx.isNewInstance) {
      ctx.instance.createdBy = currentUser.username
    } else {
      if (ctx.data) {
        ctx.data.createdBy = currentUser.username
      } else {
        ctx.instance.createdBy = currentUser.username
      }
    }
    next()
  })
}
