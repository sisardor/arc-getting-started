// var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Milestone')

var fs = require('fs')
var parse = require('csv-parse')
var path = require('path')
var constants = require('../../common/helpers/constants')

module.exports = function (app, cb) {
  var Entity = app.models.Entity

  var CSV_PATH = path.join(__dirname, '../../misc/samples/Milestones.csv')

  var parser = parse({ delimiter: '\t', columns: true }, (err, rawDate) => {
    if (err) {
      throw err
    }

    var data = rawDate.map((item) => item)
    Entity.findOne({ where: { category: constants.ENTITY_TYPE_PROJECTS } }, (err, entity) => {
      if (err) {
        return cb(err)
      }
      if (!entity) {
        logger.error('Entity.findOne returned ' + entity)
        return process.nextTick(cb)
      }
      Entity.addMilestones(entity.id, data, function (err, milestones) {
        if (err) {
          logger.error('Provisioning ERROR `Milestone`:', err)
          return cb(err)
        }
        debug('Created `Milestone`:')
        process.nextTick(cb)
      })
    })
  })

  fs.createReadStream(CSV_PATH).pipe(parser)
}
