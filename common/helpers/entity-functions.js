'use strict'
var log = require('debug')('mavis:entity-functions')
var debug = require('debug')('mavis:models:entity-functions')
var _ = require('lodash')
var async = require('async')
var CONSTANT_VALUE = 'value'
var CONSTANT_NAME = 'name'
var CONSTANT_REFERS_TO = 'refers_to'
var constants = require('./constants')
var FIELD_CHANGE = 'FIELD_CHANGE'
var logger = log4js.getLogger('entity-functions.js')

var getMilestones = function getMilestones () {
  return function (id, filter, modelName, callback) {
    var filterQuery = {}
    if (filter) {
      if (typeof filter === 'string' || filter instanceof String) {
        filterQuery = JSON.parse(filter)
      }
      else if (typeof filter === 'object') {
        filterQuery = filter
      } else {
        filterQuery = {}
      }
    }

    var self = this

    self.app.models.Link.find({ where: { 'source.link_type': 'Milestone', 'target.id': id, 'target.link_type': 'hierarchy' }})
      .then(links => {
        if (!links.length) return callback(null, [])
        var ids = links.map(link => link.source.id)
        var baseFilter = {where: {id: {inq: ids}}}
        var combinedFilter = _.assign(baseFilter, filterQuery)
        self.app.models.Milestone.find(combinedFilter, callback)

      })
      .catch(callback)
  }
}

var getProgress = function getProgress () {
  return function (id, type, commonField, callback) {
    var self = this
    type = 'status'
    let asyncTasks = []

    if (typeof commonField === 'function') {
      callback = commonField
      commonField = null

      asyncTasks.push(cb => self.app.models.CommonField.findOne({where: {name: type}}, cb))

    } else if (typeof commonField === 'object') {
      asyncTasks.push(cb => cb(null, commonField))
    }

    asyncTasks.push(
      function (commonField, cb) {
        self.app.models.Link.find({where: { 'source.id': id, 'source.link_type': 'hierarchy'}},
          function (err, links) {
            if (err) return cb(err)
            if (!links.length) return cb(err, {})

            var ids = links.map(link => link.target.id)

            self.find({ where: {id: {inq: ids}} }, function (err, result) {
              if (err) return cb(err)

              let finalObject = {}

              const fieldsStatusArray = result.map(item => item.fields.status)

              // group by name {'foo':{'name': foo, .. }}
              const indexedByName = _.indexBy(commonField.options, CONSTANT_NAME)
              const statusInstances = fieldsStatusArray.map(val => indexedByName[val])

              // console.log(statusInstances)
              // var groupedByName = _.groupBy(statusInstances, function(a){return a[CONSTANT_VALUE] })
              // log('Entity.getProgress: statusInstances:', statusInstances)

              var statCountName = {}
              var statCountValue = {}
              // log('fieldsStatusArray', fieldsStatusArray)
              // log('indexedByName', indexedByName)
              // log('statusInstances', statusInstances)
              // log('statCountName', statCountName)
              for (var i = 0; i < statusInstances.length; i++) {
                if (!statCountName[statusInstances[i][CONSTANT_NAME]])
                  statCountName[statusInstances[i][CONSTANT_NAME]] = 0
                statCountName[statusInstances[i][CONSTANT_NAME]] += 1

                if (!statCountValue[statusInstances[i][CONSTANT_REFERS_TO]])
                  statCountValue[statusInstances[i][CONSTANT_REFERS_TO]] = 0
                statCountValue[statusInstances[i][CONSTANT_REFERS_TO]] += 1
              }

              var percentageValue = {}
              var percentageName = {}

              // show the values stored
              for (var k in statCountName) {
                if (statCountName.hasOwnProperty(k)) {
                  percentageName[k] = (statCountName[k] / statusInstances.length)
                }
              }

              for (var k in statCountValue) {
                if (statCountValue.hasOwnProperty(k)) {
                  // var num = ((statCountValue[k]/statusInstances.length)*100)
                  percentageValue[k] = (statCountValue[k] / statusInstances.length); // Math.ceil(num * 100)/100
                }
              }

              finalObject.counts = {
                statusCount: statCountName,
                statusPercentage: percentageName,

                stateCount: statCountValue,
                statePercentage: percentageValue
              }

              finalObject.data = statusInstances
              cb(err, finalObject)
            })
          }
        )
      }
    )
    async.waterfall(asyncTasks, callback)
  }
}

var getDependencies = function getDependencies (Entity, loopback) {
  return function (id, filter, modelName, callback) {
    var filterQuery = {}

    if (filter) {
      if (typeof filter === 'string' || filter instanceof String) {
        filterQuery = JSON.parse(filter)
      }
      else if (typeof filter === 'object') {
        filterQuery = filter
      } else {
        filterQuery = {}
      }
    }

    Entity.app.models.Link.find({where: { 'source.id': id, 'source.link_type': 'hierarchy'}})
      .then(links => {
        if (!links.length) { return callback(null, []); }

        const ids = links.map(link => link.target.id)
        const mergedFilter = _.merge({where: {id: {inq: ids}}}, filterQuery)
        Entity.find(mergedFilter, callback)
      })
      .catch(callback)
  }
}

var publish = function publish () {
  return function (id, isMajorVersion, callback) {
    var self = this

    self.findOne({
      where: { id: id },
      include: { EntityType: ['onPublish', 'commonFields', 'customFields']}
    })
      .then(entity => {
        self.getUpTree(id, function (err, nodes) {
          if (err) return callback(err)
          var ids = [id]
          nodes.forEach(item => {
            if (item.source.category === constants.ENTITY_TYPE_GROUPS) {
              ids.push(item.source.id)
            }
            else if (item.source.category === constants.ENTITY_TYPE_PROJECTS) {
              ids.push(item.source.id)
            }
          })

          var actions = entity.EntityType().onPublish()

          if (!actions || actions.length === 0) {
            var error = new Error('Entity "' + id + '" has no "onPublish" Actions.')
            error.statusCode = error.status = 404
            return callback(error)
          }

          actions[0].__publish(entity, ids, (err, msg) => callback(err, entity))
        })
      })
      .catch(callback)
  }
}
module.exports = {
  getMilestones: getMilestones,
  getProgress: getProgress,
  getDependencies: getDependencies,
  publish: publish
}
