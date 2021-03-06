// var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:CustomField')

var fs = require('fs')
var parse = require('csv-parse')
var path = require('path')

module.exports = function (app) {
  var CustomField = app.models.CustomField

  var CSV_PATH = path.join(__dirname, '../../misc/samples/CustomFields.csv')

  var parser = parse({delimiter: '\t', columns: true}, function (err, rawDate) {
    if (err) {
      throw err
    }
    var data = rawDate.map(function (item) {
      item.options = (item.options !== '') ? item.options.split(',') : []
      return item
    })

    CustomField.create(data, {provisioning: true}, function (err, customfields) {
      if (err) {
        logger.error('Provisioning ERROR `CustomField`:', err)
        return //cb(err)
      }
      debug('Created `CustomField`:')
      // process.nextTick(cb)
    })
  })

  fs.createReadStream(CSV_PATH).pipe(parser)
}
