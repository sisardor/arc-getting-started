/*jshint unused: true, node: true, latedef: nofunc, curly: true, debug: true */

var debug = require('debug')('mavis:models:library')
var async = require('async')
var constants = require('../helpers/constants')

module.exports = function (Library) {
  Library.observe('before save', function (ctx, next) {
    debug('-- Library.observe before save --')
    var Entity = ctx.Model.app.models.Entity

    var libraryInstance = (ctx.isNewInstance) ? ctx.instance : ctx.data

    debug(libraryInstance)

    // create tasks of ifExists to run in parallel
    var tasks = libraryInstance.entityIds.map(function (entityID) {
      return ifExists.bind(ifExists, Entity, entityID)
    })

    // run in parallel
    async.parallel(
      tasks,
      next
    )
  })
}

function ifExists (Model, id, callback) {
  var filter = { where: { } }
  filter.where[constants.CONSTANT_CATEGORY] = constants.ENTITY_TYPE_ASSETS
  filter.where.id = id

  Model.find(filter, function (err, entity) {
    if (err) { return callback(err, null); }

    if (!entity.length) {
      return callback(new Error('`Entity` of category=assets and id='
        + id + ' does not exist'), null)
    }
    return callback(err, true)
  })
}
