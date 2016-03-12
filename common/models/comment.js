// /* global log4js */
var loopback = require('loopback')
var guid = require('../helpers/util').guid
// var logger = log4js.getLogger('comment.js')

module.exports = function (Comment) {
  Comment.validatesPresenceOf('text', {message: 'Cannot be blank'})

  Comment.observe('before save', function (ctx, next) {
    if (ctx.options && ctx.options.skipPropertyProvisioning) return next()

    if (ctx.isNewInstance) {
      const slug_part = guid(3)
      const full_slug_part = new Date().getTime() + ':' + slug_part

      ctx.instance.slug = slug_part
      ctx.instance.full_slug = full_slug_part
      ctx.instance.parentId = ctx.instance.entityId
    }
    next()
  })
  Comment.observe('before save', function (ctx, next) {
    if (!loopback.getCurrentContext()) return next()
    var currentUser = loopback.getCurrentContext().get('currentUser')

    if (ctx.isNewInstance && currentUser) {
      ctx.instance.author(currentUser)
    }

    next()
  })

  Comment.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance && ctx.instance.references()) {
      const data = ctx.instance.references().map((item) => {
        item.referableId = ctx.instance.id
        return item
      })

      ctx.instance.references.create(data)
        .then(function (refs) {
          ctx.instance.__cachedRelations.references = refs
          ctx.instance.__data.references = refs
          next()
        })
        .catch(next)
    } else next()
  })

  Comment.observe('after save', function (ctx, next) {
    ctx.instance.author((err, author) => {
      if (err) return next(err)
      ctx.instance.__data.author = author
      return next()
    })
  })

  Comment.remoteMethod('reply', {
    description: ('Comment reply'),
    accepts: [{
      arg: 'id',
      type: 'any',
      description: 'Comment id',
      required: true,
      http: {
        source: 'path'
      }
    }, {
      arg: 'data',
      type: 'object',
      description: 'new Comment instance data',
      required: true,
      http: {
        source: 'body'
      }
    }],
    returns: {
      arg: 'data',
      type: 'Comment',
      root: true
    },
    http: {
      verb: 'post',
      path: '/:id/reply'
    }
  })

  Comment.reply = function (id, data, next) {
    Comment.findById(id, function (err, comment) {
      if (err) return next(err)

      const slug_part = guid(3)
      const full_slug_part = new Date().getTime() + ':' + slug_part

      data.slug = comment.slug + '/' + slug_part
      data.full_slug = comment.full_slug + '/' + full_slug_part
      data.entityId = comment.entityId
      data.parentId = comment.id

      var newComment = new Comment(data)
      newComment.save({skipPropertyProvisioning: true}, next)
    })
  }
}
