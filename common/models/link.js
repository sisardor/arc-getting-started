/* jslint node: true,  white: true, unparam: true */
/* jshint unused: true, node: true */
'use strict'
// var debug = require('debug')('mavis:models:Link')
var async = require('async')

module.exports = function (Link) {
  Link.includeAllChildren = function includeAllChildren (sourceId, modelName, callback) {
    Link.find({ where: { 'source.id': sourceId } }, function (err, links) {
      if (err) return callback(err)
      if (!links.length) return callback(err, [])

      var _targetModel = Link.app.models[links[0].target.link_type]

      var getEntity = function (id, cb) {
        _targetModel.findById(id, cb)
      }

      var tasks = links.map(function (link) {
        return getEntity.bind(getEntity, link.target.id)
      })

      // runs in parallel
      async.parallel(
        tasks,
        callback
      )
    })
  }

  Link.remoteMethod('includeAllChildren', {
    description: ('Create a new Entity instance, setting it as a dependency '),
    accepts: [
      {
        arg: 'sourceId',
        type: 'any',
        description: 'Id of source Entity',
        required: true,
        http: {
          source: 'path'
        }
      }, {
        arg: 'model',
        type: 'any',
        description: 'Model name',
        http: {
          source: 'query'
        }
      }
    ],
    returns: {
      arg: 'data',
      type: 'any',
      root: true
    },
    http: {
      verb: 'get',
      path: '/:sourceId/include'
    }
  })
}
