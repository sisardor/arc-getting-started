var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Entity')
var importTool = require('../../test/importTool')
var fs = require('fs')
var parse = require('csv-parse')
var path = require('path')

module.exports = function (app) {
  var Entity = app.models.Entity
  debug('Created `Entity`: start')
  var CSV_PATH = path.join(__dirname, '../../misc/samples/Entities.csv')

  function createEntities (array) {
    var root = array[constants.CONST_ROOT]
    debug('Created `Entity`: root', root)
    for (var i = 0; i < root.length; i++) {
      makePostRequest(array, root[i].name, root[i], null)
    }
    setTimeout(function () {
      // callback()
    }, 100)
  }

  function makePostRequest (obj, key, entity, parentId) {
    post(entity, parentId, function (err, newEntity) {
      if (err) {
        console.error(err)
        // return callback(err)
      }

      var array = obj[key] || []
      if (array.length) {
        for (var i = 0; i < array.length; i++) {
          makePostRequest(obj, array[i].name, array[i], newEntity.id)
        }
      }
    })
  }

  function post (_entity, id, next) {
    // logger.info(entity)
    // next(null, entity)
    // return
    debug('Created `Entity`: `%j`', _entity)
    if (id !== null) {
      Entity.createDependency(id, _entity, true, function (err, entity) {
        if (err) return next(err)
        // var entityCategory = entity.category || ''
        // if (entityCategory) {
        //   // E.g. provisionedEntities.groups = [{G001}, {G002}, ...]
        //   // Ensure the correct keys have been set.
        //   if (!provisionedEntities[entityCategory]) {
        //     provisionedEntities[entityCategory] = []
        //   }
        //   provisionedEntities[entityCategory].push(entity)
        // }

        next(err, entity)
      })
    } else {
      // Projects don't have a parent ID.
      Entity.create(_entity, function (err, entity) {
        if (err) return next(err)
        // var entityCategory = entity.category || ''
        // if (entityCategory) {
        //   // E.g. provisionedEntities.projects = [{P001}, {P002}, ...]
        //   if (!provisionedEntities[entityCategory]) {
        //     provisionedEntities[entityCategory] = []
        //   }
        //   provisionedEntities[entityCategory].push(entity)
        // }
        debug('Created `Entity`: `%j`', entity)
        next(err, entity)
      })
    }
  }

  var parser = parse({ delimiter: '\t', columns: true }, (err, rawData) => {
    if (err) {
      throw err
    }
    createEntities(importTool.importEntities(rawData))
  })

  fs.createReadStream(CSV_PATH).pipe(parser)
}

function setCreatedBy (array, username) {
  for (var i = array.length - 1; i >= 0; i--) {
    array[i].createdBy = username
  }
}
