var constants   = require('../../common/helpers/constants');
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Entity')

var fs = require('fs');
var parse = require('csv-parse');
var path = require('path');

module.exports = function(app) {
  var Entity = app.models.Entity;

  var CSV_PATH = path.join(__dirname, '../../misc/samples/Entities.csv');


  var parser = parse({delimiter: '\t', columns: true}, (err, rawData) => {
    createEntities(processDate(data))
  })

  fs.createReadStream(CSV_PATH).pipe(parser);
}


function createEntities(array) {
  return
  var root = array[constants.CONST_ROOT];
  for (var i = 0; i < root.length; i++) {
    makePostRequest(array, root[i].name, root[i], null);
  }
  setTimeout(function() {
    callback()
  }, 100);

}

function makePostRequest(obj, key, entity, parentId) {
  post(entity, parentId, function(err, newEntity){
    if(err) {
      console.error(err)
      return callback(err)
    }

    var array = obj[key] || [];
    if(array.length) {
      for (var i = 0; i < array.length; i++) {
        makePostRequest(obj, array[i].name, array[i], newEntity.id)
      }
    }
  })
}

function post(entity, id, next) {
  if (id !== null) {
    app.models.Entity.createDependency(id, entity, true, function (err, entity) {
      if(err) return next(err)
      var entityCategory = entity.category || '';

      if (entityCategory) {
        // E.g. provisionedEntities.groups = [{G001}, {G002}, ...]

        // Ensure the correct keys have been set.
        if (!provisionedEntities[entityCategory]) {
          provisionedEntities[entityCategory] = [];
        }

        provisionedEntities[entityCategory].push(entity);
      }

      next(err, entity);
    });
  }
  else {
    // Projects don't have a parent ID.
    app.models.Entity.create(entity, function (err, entity) {
      if(err) return next(err)
      var entityCategory = entity.category || '';

      if (entityCategory) {
        // E.g. provisionedEntities.projects = [{P001}, {P002}, ...]
        if (!provisionedEntities[entityCategory]) {
          provisionedEntities[entityCategory] = [];
        }

        provisionedEntities[entityCategory].push(entity);
      }

      next(err, entity);
    });
  }
}
function processDate(array) {
  array = util.setFields(array, constants.CONST_FIELDS,
               constants.CONSTANT_COMMON_FIELDS)
  console.log('_____________')
  console.log(array)
  setCreatedBy(array, constants.CONST_DEMO_USERNAME)
  return _groupBy(array, function(item){
    return item.parent
  })
}

function setCreatedBy(array, username) {
  for (var i = array.length - 1; i >= 0; i--) {
    array[i].createdBy = username;
  }
}