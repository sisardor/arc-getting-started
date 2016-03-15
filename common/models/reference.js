var logger = require('tracer').colorConsole()
var multer = require('multer')
var path = require('path')
var crypto = require('crypto')

const CONST_REFERENCES = 'references'

const STATIC_SERVER = process.env.MAVIS_STATIC_URL || 'http://192.168.99.100:8002'
module.exports = function (Reference) {
  Reference.observe('loaded', function (ctx, next) {
    if (ctx.instance && ctx.instance.fstat) {
      if (ctx.instance.fstat.mimetype.match('^image\/(gif|jpe?g|png)$')) {
        ctx.instance.preview = ctx.instance.path.replace(process.env.MAVIS_STATIC_PATH, STATIC_SERVER)
        ctx.instance.url = ctx.instance.path.replace(process.env.MAVIS_STATIC_PATH, STATIC_SERVER)
      }
    }
    next()
  })

  Reference.observe('after save', function (ctx, next) {
    // if (ctx.instance) {
    //   ctx.instance._host = process.env.MAVIS_STATIC_URL || 'http://192.168.99.100:8002'
    // }
    if (ctx.instance && ctx.instance.fstat) {
      if (ctx.instance.fstat.mimetype.match('^image\/(gif|jpe?g|png)$')) {
        ctx.instance.preview = ctx.instance.path.replace(process.env.MAVIS_STATIC_PATH, STATIC_SERVER)
        ctx.instance.url = ctx.instance.path.replace(process.env.MAVIS_STATIC_PATH, STATIC_SERVER)
      }
    }
    next()
  })

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const PROJECT_NAME = req.__$project

      if (!PROJECT_NAME) {
        var error = new Error('Forum fields must be attached first to http form-data, before files')
        error.status = 400
        return cb(error)
      }

      const dst = path.join(process.env.MAVIS_STATIC_PATH, CONST_REFERENCES, PROJECT_NAME)

      logger.debug('file destination: ', dst)
      cb(null, dst); // Absolute path. Folder must exist, will not be created for you.
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname)
      const token = '_' + crypto.randomBytes(3).toString('hex')
      const newFilename = file.originalname.replace(fileExtension, token + fileExtension)

      logger.debug('renaming file: `%s` --> `%s`', file.originalname, newFilename)
      cb(null, newFilename)
    },
    onFileUploadStart: function (file) {
      console.log('Upload starting for filename: ' + file.originalname)
    },
    onError: function (e, next) {
      if (e) {
        console.log(e.stack)
      }
      next()
    }
  })
  var upload = multer({ storage: storage }).single('file')

  Reference.upload = function (id, req, res, callback) {

    Reference.app.models.Entity.findById(id)
      .then(entity => {
        req.__$project = entity.project
        upload(req, res, function (err) {
          if (err) {
            logger.error(err)
            return callback(err)
          }
          logger.info(req.file)
          const result = {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }

          if (req.file.encoding) {
            result.encoding = req.file.encoding
          }

          var data = {
            referableType: Reference.app.models.Entity.modelName,//'Entity',
            referableId: id,
            filename: req.file.filename,
            path: req.file.path,
            thumbnail: req.file.path,
            fstat: result,
          }

          Reference.create(data, callback)
        })
      })
      .catch(callback)


  }

  Reference.remoteMethod(
    'upload',
    {
      description: 'Uploads a file',
      accepts: [
        {arg: 'id', type: 'any', 'required': true, 'description': 'Entity id', 'http': {source: 'path'}},
        {arg: 'req', type: 'object', 'http': {source: 'req'}},
        {arg: 'res', type: 'object', 'http': {source: 'res'}}
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true
      },
      http: {path: '/:id/upload', verb: 'post'}
    }
  )
}
