// /* global log4js */
var loopback = require('loopback')
// var guid = require('../helpers/util').guid
// var logger = log4js.getLogger('comment.js')
var logger = require('tracer').colorConsole()

module.exports = function (Objective) {
  Objective.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.epoch_time = Math.round(
        new Date(ctx.instance.createdAt).getTime() / 1000.0)
    }
    next()
  })

  Objective.observe('before save', function (ctx, next) {
    if (!loopback.getCurrentContext()) { return next() }
    var currentUser = loopback.getCurrentContext().get('currentUser')

    if (ctx.isNewInstance && currentUser) {
      ctx.instance.author(currentUser)
    }
    next()
  })

  Objective.observe('after save', function (ctx, next) {
    ctx.instance.author((err, author) => {
      if (err) { return next(err) }
      ctx.instance.__data.author = author
      return next()
    })
  })

  Objective.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance) {
      const references = ctx.instance.references()
      if (references && references.length) {
        references.forEach((ref) => {
          ref.referableId = ctx.instance.id
        })

        ctx.instance.references.create(references)
          .then((refs) => {
            ctx.instance.__data.references = refs
            next()
          })
          .catch(next)
      } else {
        logger.debug('fail')
        ctx.instance.__data.references = []
        next()
      }
    } else next()
  })
}
