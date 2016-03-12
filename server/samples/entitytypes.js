var constants   = require('../../common/helpers/constants');
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:EntityType')

var fs = require('fs');
var parse = require('csv-parse');
var path = require('path');

module.exports = function(app) {
  var EntityType = app.models.EntityType;

  var CSV_PATH = path.join(__dirname, '../../misc/samples/EntityTypes.csv');

  var parser = parse({delimiter: '\t', columns: headParse}, (err, rawDate) => {
    var data = rawDate.map(function(item){
      item.createdBy = constants.CONST_DEMO_USERNAME;

      // Convert CSV array field to JS Array.
      if (item.subscriptions) {
        item.subscriptions = item.subscriptions.split(',');
      }

      return item;
    })

    EntityType.create(data, { provisioning: true }, (err, entityTypes) => {
      if (err) {
        logger.error('Provisioning ERROR `EntityType`:', err)
      }
      debug('Created `EntityType`: `%j`', entityTypes)
    })
  })

  fs.createReadStream(CSV_PATH).pipe(parser);
}


function headParse(vals) {
  return vals.map(function(val){
    return val.toLowerCase()
  });
}