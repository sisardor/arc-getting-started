// var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Milestone')

var fs = require('fs')
var parse = require('csv-parse')
var path = require('path')

module.exports = function (app) {
  var Entity = app.models.Entity

  var CSV_PATH = path.join(__dirname, '../../misc/samples/Milestones.csv')

  var parser = parse({ delimiter: '\t', columns: true }, (err, rawDate) => {
    if (err) {
      throw err
    }

    var data = rawDate.map((item) => item)
    Entity.findOne({ where: { category: 'projects' } })
      .then(entity => {
        Entity.addMilestones(entity.id, data, function (err, milestones) {
          if (err) {
            logger.error('Provisioning ERROR `Milestone`:', err)
            return
          }
          debug('Created `Milestone`: `%j`', milestones)
        })
      })
      .catch(err => {
        logger.error('Provisioning ERROR `Milestone`:', err)
      })
  })

  fs.createReadStream(CSV_PATH).pipe(parser)
}
