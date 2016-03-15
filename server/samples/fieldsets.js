// var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Fieldset')

var fs = require('fs')
var parse = require('csv-parse')
var path = require('path')

module.exports = function (app) {
  var Fieldset = app.models.Fieldset

  var CSV_PATH = path.join(__dirname, '../../misc/samples/Fieldsets.csv')

  var parser = parse({ delimiter: '\t', columns: true }, (err, rawDate) => {
    if (err) {
      throw err
    }

    var data = rawDate.map((item) => {
      item.inputs = item.inputs.split(/[;,:]/)
      if (item.inputs[item.inputs.length - 1] === '') {
        item.inputs.pop()
      }
      return item
    })

    Fieldset.create(data, { provisioning: true }, (err, fieldset) => {
      if (err) {
        logger.error('Provisioning ERROR `Fieldset`:', err)
        return// cb(err)
      }
      debug('Created `Fieldset`:')
      // process.nextTick(cb)
    })
  })

  fs.createReadStream(CSV_PATH).pipe(parser)
}
