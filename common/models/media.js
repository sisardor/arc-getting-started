var path = require('path')
module.exports = function (Media) {
  Media.observe('loaded', function (ctx, next) {
    if (ctx.instance) {
      ctx.instance.host = process.env.MAVIS_STATIC_URL ||
        'http://192.168.99.100:8002'
      if (process.env.MAVIS_STATIC_PATH && ctx.instance.uri) {
        ctx.instance.path = path.join(process.env.MAVIS_STATIC_PATH,
          ctx.instance.uri)
      }
    }
    next()
  })

  Media.observe('after save', function (ctx, next) {
    if (ctx.instance) {
      ctx.instance.host = process.env.MAVIS_STATIC_URL ||
        'http://192.168.99.100:8002'
      if (process.env.MAVIS_STATIC_PATH && ctx.instance.uri) {
        ctx.instance.path = path.join(process.env.MAVIS_STATIC_PATH,
          ctx.instance.uri)
      }
    }
    next()
  })
  Media.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance && ctx.instance) {
      // ctx.instance.host = process.env.MAVIS_STATIC_URL ||
      //   'http://192.168.99.100:8002'
      if (process.env.MAVIS_STATIC_PATH && ctx.instance.uri) {
        ctx.instance.path = path.join(process.env.MAVIS_STATIC_PATH,
          ctx.instance.uri)
      }
    }
    next()
  })
}
