var path = require('path')
var FileManager = require('../../lib/mavis-fs-manager')
var logger = require('tracer').colorConsole() // log4js.getLogger('entity.js')
var debug = require('debug')('mavis:models:container')
var crypto = require('crypto')
const STORAGE_LOCATION = './server/storage'

module.exports = function (Container) {
  Container.afterRemote('upload', function (context, unused, next) {
    const FILE = unused.result.files.file[0]

    if (!unused.result.fields.project) {
      var error = new Error('fields.project is missing')
      logger.error(error)
      Container.removeFile(currentContainer, originalFilename)
      return next(error)
    }
    if (unused.result.fields.filmStrip) {
      logger.info('CREATE FILM STRIP')
      FILE.film_strip = true
    }

    const currentContainer = context.req.params.container
    const originalFilename = FILE.name
    const fileExtension = path.extname(originalFilename)
    const filename = FILE.name // .replace('.', new Date().getTime() + '.')
    const token = '_' + crypto.randomBytes(3).toString('hex')
    const newFilename = filename.replace(fileExtension, token + fileExtension)
    logger.debug('Container.afterRemote(upload): filename:%s  size:%d type:%s', FILE.name, FILE.size, FILE.type)

    // rename
    FILE.name = newFilename

    const projectName = unused.result.fields.project[0]
    const src = path.join(process.cwd(), STORAGE_LOCATION, currentContainer, filename)
    const dst = path.join(process.env.MAVIS_STATIC_PATH, currentContainer, projectName, newFilename)
    const uri = path.join(currentContainer, projectName, newFilename)

    FileManager.move(src, dst, (err, result) => {
      if (err) {
        logger.error(err)
        Container.removeFile(currentContainer, originalFilename)
        return next(err)
      }
      unused.result.files.file[0].uri = uri

      logger.debug('FILE UPLOAD SUCCESS - %j', JSON.stringify(FILE))
      next()
    })
  })
}
