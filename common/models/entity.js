/* jshint unused: false, node: true , laxbreak: true, bitwise: false*/
/* jshint latedef: nofunc, curly: true, debug: true */
/* global _$MAVIS_CONFIG */
'use strict'
var path = require('path')
var debug = require('debug')('mavis:models:entity')
var FileManager = require('../../lib/mavis-fs-manager')
var _ = require('lodash')
var helpers = require('../helpers/entity-validation')
var entityRemoteMethods = require('../helpers/entity-remoteMethods')
var entityRemoteFunctions = require('../helpers/entity-functions')
var loopback = require('loopback')
var async = require('async')
var logger = require('tracer').colorConsole()
var config = _$MAVIS_CONFIG
var utils = require('../helpers/util')
var constants = require('../helpers/constants')
var searchQuery = require('search-query-parser')
var filterBuilder = require('../helpers/filter-builder')

module.exports = function (Entity) {
  // Validators
  Entity.validatesInclusionOf(
    constants.CONSTANT_CATEGORY, {
      'in': [ constants.ENTITY_TYPE_ASSETS,
        constants.ENTITY_TYPE_GROUPS,
        constants.ENTITY_TYPE_TASKS,
        constants.ENTITY_TYPE_PROJECTS
      ]
    })
  Entity.validatesPresenceOf('name', {message: 'Cannot be blank'})
  Entity.validatesPresenceOf('project', {message: 'Cannot be blank'})
  Entity.validatesUniquenessOf('path')

  /*
  ===============================================================
  ================================== BEFORE ======================
  ===============================================================
  */

  /**
   * Strongloop operation hook, validate Entity@fields,
   * according EntityType's common and custom fields
   * @param  {Object} ctx   strongloop context
   * @param  {Function} next callback
   */
  Entity.observe('before save', function (ctx, next) {
    // The context provides either an instance property
    // or a pair of data and where properties.
    // Validate existance of type, name, category
    if (ctx.hasOwnProperty('isNewInstance') && ctx.isNewInstance) {
      helpers.validateProperties(ctx.Model.app.models, ctx.instance,
        ctx.instance.type, next)
    } else if (ctx.hasOwnProperty('isNewInstance') &&
      !ctx.isNewInstance && ctx.currentInstance) {
      helpers.validateProperties(ctx.Model.app.models, ctx.data,
        ctx.currentInstance.type, next)
    } else {
      next()
    }
  })

  /**
   * Provision some of the Entity properties. All entities must
   * belong to a project. For project entities, set @project to
   * the project's name.
   */
  Entity.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
      if (!ctx.instance.name) {
        return next(new Error('`name` not found in the body'), null)
      }

      if (ctx.instance[constants.CONSTANT_CATEGORY] ===
        constants.ENTITY_TYPE_PROJECTS) {
        ctx.instance.path = path.join(config.path_prefix,
          ctx.instance.type, utils.slugify(ctx.instance.name))

        ctx.instance.project = ctx.instance.name
      }

      if (ctx.instance.fileImportPath) {
        ctx.instance.fileImportPath = path.join(
          config.import_directory_path,
          ctx.instance.fileImportPath
        )
      }
    }

    next()
  })

  Entity.observe('before save', function (ctx, next) {
    // Validate existance of type, name, category
    if (ctx.isNewInstance) {
      ctx.hookState.actions = []
      if (ctx.instance[constants.MILESTONES]) {
        let action = {
          type: constants.ADD_MILESTONES,
          payload: ctx.instance[constants.MILESTONES]
        }
        ctx.hookState.actions.push(action)
        ctx.instance.unsetAttribute(constants.MILESTONES)
      }

      if (ctx.instance.assignees()) {
        let action = {
          type: constants.ADD_ASSIGNEES,
          payload: ctx.instance.assignees()
        }
        ctx.hookState.actions.push(action)
      }
      next()
    } else {
      next()
    }
  })

  // UPDATE milestones and assigeens
  Entity.observe('before save', function (ctx, next) {
    // PUT UPDATE
    if (!ctx.isNewInstance && ctx.data && ctx.data.assignees) {
      const currentAssignees = ctx.currentInstance.assignees()
      const dataAssignees = ctx.data.assignees

      const OLD_IDS = currentAssignees.map((i) => i.id)
      const DATA_IDS = dataAssignees.map((i) => i.id)

      const createArray = _.difference(DATA_IDS, OLD_IDS)
      const deleteArray = _.difference(OLD_IDS, DATA_IDS)

      let oldAssignees = deleteArray.map((id) =>
        new Entity.app.models.User({id}))
      let newAssignees = createArray.map((id) =>
        new Entity.app.models.User({id}))

      var parallelTasks = []

      oldAssignees.forEach((assignee) =>
        parallelTasks.push((cb) =>
          ctx.currentInstance.assignees.remove(assignee, cb))
      )

      newAssignees.forEach((assignee) =>
        parallelTasks.push((cb) =>
          ctx.currentInstance.assignees.add(assignee, cb))
      )

      async.parallel(parallelTasks, next)
    } else {
      next()
    }
  })

  Entity.observe('before save', function (ctx, next) {
    // PUT UPDATE_MILESTONES
    if (!ctx.isNewInstance && ctx.data && ctx.data[constants.MILESTONES]) {
      const id = ctx.currentInstance.id
      Entity.getMilestones(id, {}, '', (err, milestones) => {
        if (err) { return next(err) }

        var newMilestones = ctx.data[constants.MILESTONES]
        delete ctx.data[constants.MILESTONES]

        const _oldIds = milestones.map((i) => i.id)
        const _newIds = newMilestones.map((i) => i.id)

        let createArray = _.difference(_newIds, _oldIds)
        let deleteArray = _.difference(_oldIds, _newIds)

        const newMilestoneData = newMilestones
          .filter((i) => createArray.indexOf(i.id) > -1)
          .map((i) => ({
            source: {id: i.id, link_type: 'Milestone'},
            target: {id: ctx.currentInstance.id, link_type: 'hierarchy'}
          })
        )

        let ids = ctx.currentInstance[constants.MILESTONES]
          .filter((i) => deleteArray.indexOf(i.id) > -1)
          .map((i) => i.id)

        let _filter = {
          'target.id': ctx.currentInstance.id,
          'source.link_type': 'Milestone',
          'source.id': { inq: ids }
        }

        if (deleteArray.length) {
          Entity.app.models.Link.destroyAll(_filter)
        }
        if (createArray.length) {
          Entity.app.models.Link.create(newMilestoneData)
        }

        next()
      })
    } else {
      next()
    }
  })

  /*
  ===============================================================
  ================================== ACCESS ======================
  ===============================================================
  */
  Entity.observe('access', function (ctx, next) {
    ctx.query.include = (ctx.query.include)
      ? ctx.Model.normalizeInclude(['media', 'assignees', ctx.query.include])
      : ['media', 'assignees']

    ctx.query.include = _.uniq(ctx.query.include)
    if (ctx.options) {
      ctx.options.includeLatestMilestone = true
    }
    next()
  })

  Entity.observe('access', function (ctx, next) {
    ctx.hookState.actions = []
    var goToNext = true

    if ((ctx.query && ctx.query.includeProgress) || (ctx.options &&
      ctx.options.includeProgress)) {
      let action = {}
      action.type = constants.PROVISION_PROGRESS
      action.query = ctx.query
      goToNext = false
      Entity.app.models.CommonField.findOne(
        { where: { name: ctx.query.includeProgress } },
        (err, commonField) => {
          if (err) { return next(err) }
          action.commonField = commonField.toJSON()
          ctx.hookState.actions.push(action)
          next()
        }
      )
    }

    if ((ctx.query && ctx.query.includeDependencyCount) ||
      (ctx.options && ctx.options.includeDependencyCount)) {
      let action = {}
      action.type = constants.PROVISION_DEPENDENCY_COUNT
      action.query = ctx.query
      // TODO: handle query in Entity.observe:loaded()
      ctx.hookState.actions.push(action)
    }

    if ((ctx.query && ctx.query.includeLatestMilestone) ||
      (ctx.options && ctx.options.includeLatestMilestone)) {
      let action = {}
      action.type = constants.PROVISION_LATEST_MILESTONE
      action.query = ctx.query
      // TODO: handle query in Entity.observe:loaded()
      ctx.hookState.actions.push(action)
    }

    if (goToNext) {
      next()
    }
  })

  /*
  ===============================================================
  ================================== LOADED ======================
  ===============================================================
  */
  Entity.observe('loaded', function (ctx, next) {
    // {"source.id":"3","source.type":"Entity"}
    if (!ctx.isNewInstance && ctx.hookState.actions &&
      ctx.hookState.actions.length) {
      var parallelTasks = {}

      for (var i = 0; i < ctx.hookState.actions.length; i++) {
        var action = ctx.hookState.actions[i]
        switch (action.type) {
          case constants.PROVISION_PROGRESS:
            parallelTasks[constants.PROGRESS] = (callback) => {
              Entity.getProgress(
                ctx.instance.id,
                action.query.includeProgress,
                action.commonField,
                callback
              )
            }

            break
          case constants.PROVISION_LATEST_MILESTONE:
            parallelTasks[ constants.MILESTONES ] = (callback) => {
              var filter = {order: 'dueDate DESC'}
              Entity.getMilestones(ctx.instance.id, filter, {}, callback)
            }

            break
          case constants.PROVISION_DEPENDENCY_COUNT:
            parallelTasks[ constants.DEPENDENCY_COUNT ] = (callback) => {
              var where = {
                'source.id': ctx.instance.id,
                'source.link_type': 'hierarchy'
              }
              Entity.app.models.Link.count(where, callback)
            }

            break
          default:
            break
        }
      }

      async.parallel(
        parallelTasks,
        (err, results) => { // callback
          // results is now equals to: {one: 1, two: 2} ... @see async docs
          if (err) { return next(err) }
          ctx.instance = _.assign(ctx.instance, results)
          return next()
        }
      )
    } else {
      next()
    }
  })

  /*
  ===============================================================
  ================================== ASTER ======================
  ===============================================================
  */

  Entity.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance && ctx.hookState.actions &&
      ctx.hookState.actions.length) {
      for (var i = 0; i < ctx.hookState.actions.length; i++) {
        if (ctx.hookState.actions[i].type === constants.ADD_ASSIGNEES) {
          const newAssignees = ctx.hookState.actions[i].payload
          newAssignees.forEach((assigneeObj) =>
            ctx.instance.assignees.add(new Entity.app.models.User(assigneeObj)))
          continue
        }
      }
      next()
    } else {
      next()
    }
  })

  Entity.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance && ctx.hookState.actions &&
      ctx.hookState.actions.length) {
      for (var i = 0; i < ctx.hookState.actions.length; i++) {
        if (ctx.hookState.actions[i].type === constants.ADD_MILESTONES) {
          const milestoneArray = ctx.hookState.actions[i].payload
          const milestoneData = milestoneArray.map((item) => ({
            source: {id: item.id, link_type: 'Milestone'},
            target: {id: ctx.instance.id, link_type: 'hierarchy'}
          })
          )
          Entity.app.models.Link.create(milestoneData)
        }
      }
      next()
    } else {
      next()
    }
  })

  Entity.observe('after save', function (ctx, next) {
    const modelName = ctx.Model.modelName

    if (ctx.hasOwnProperty('isNewInstance') && ctx.isNewInstance) {
      debug('Saved %s#%s', ctx.Model.modelName, ctx.instance.id)
      createActivity('created', ctx.instance, modelName, next)
    } else if (ctx.hasOwnProperty('isNewInstance') &&
      !ctx.isNewInstance && ctx.currentInstance) {
      debug('Updated %s#%s matching %j', ctx.Model.pluralModelName,
        ctx.currentInstance.id, ctx.where)
      createActivity('updated', ctx.data, modelName, next)
    } else if (ctx.options.bulkUpdate) {
      debug('Updated %s#%s matching %j', ctx.Model.pluralModelName,
        ctx.instance.id, ctx.where)
      createActivity('updated', ctx.instance, modelName, next)
    } else {
      next()
    }
  })

  Entity.observe('after save', function (ctx, next) {
    if (ctx.isNewInstance) {
      return FileManager.mkdir(ctx.instance.path, next)
    }
    next()
  })

  Entity.observe('after save', function (ctx, next) {
    if (ctx.hasOwnProperty('isNewInstance') &&
      (ctx.isNewInstance || !ctx.isNewInstance)) {
      ctx.instance.assignees({})
        .then((assignees) => {
          ctx.instance.__data.assignees = assignees
          next()
        })
        .catch(next)
    } else {
      next()
    }
  })

  Entity.observe('after save', function (ctx, next) {
    if (ctx.hasOwnProperty('isNewInstance') &&
      (ctx.isNewInstance || !ctx.isNewInstance)) {
      Entity.getMilestones(ctx.instance.id, {}, '', (err, milestones) => {
        if (err) { return next(err) }
        ctx.instance[constants.MILESTONES] = milestones
        next()
      })
    } else {
      next()
    }
  })

  var overrideUpdateAll = Entity.updateAll
  Entity.updateAll = function (where, data, callback) {
    if (data.hasOwnProperty(constants.CONST_FIELDS)) {
      logger.error(data)
      Entity.find({ where: where })
        .then((entities) => {
          entities.forEach((entity) => {
            entity.fields = Object.assign({}, entity.fields,
                              data.fields)
            entity.save({bulkUpdate: true}, (err, res) => {
              logger.error(err, res)
            })
          })
          callback(null, {count: entities.length})
        })
        .catch(callback)
    } else {
      return overrideUpdateAll.apply(this, arguments)
    }
  }

  Entity.addMilestones = function addMilestones (id, callback) {
    Entity.getMilestones(id, {}, '', function (err, milestones) {
      if (err) {
        logger.error(err)
        callback(err)
      }

      logger.info('addMilestones', JSON.stringify(milestones, null, 4))
      callback()
    })
  }

  Entity.remoteMethod('getProgress', entityRemoteMethods.getProgress)
  Entity.getProgress = entityRemoteFunctions.getProgress()

  Entity.remoteMethod('getMilestones', entityRemoteMethods.getMilestones)
  Entity.getMilestones = entityRemoteFunctions.getMilestones()

  Entity.remoteMethod('publish', entityRemoteMethods.publish)
  Entity.publish = entityRemoteFunctions.publish()

  Entity.remoteMethod('getDependencies', entityRemoteMethods.getDependencies)
  Entity.getDependencies = entityRemoteFunctions
                            .getDependencies(Entity, loopback)

  Entity.afterRemote('getDependencies', function (ctx, entities, next) {
    logger.info(ctx.methodString, 'was invoked remotely')
    const filter = {
      'source.id': ctx.args.id,
      'source.link_type': 'hierarchy'}

    Entity.app.models.Link.count(filter)
      .then((count) => {
        ctx.res.set('X-Total-Count', count)
        next()
      })
      .catch(next)
  })

  Entity.querySearch = function (ctx, q, callback) {
    Entity.app.models.CommonField.find({}, function (err, commonFields) {
      if (err) { return callback(err) }

      var allOptions = commonFields.map((item) => item.options)

      // flatten the array, [[],[]] => []
      allOptions = [].concat.apply([], allOptions)

      var dict = {}
      allOptions.forEach((item) => {
        dict[item.label] = item.name
        // TODO: CommonField@options.name will be changed to value
      })

      var options = { keywords: [ 'in', 'Project', 'Type', 'Category',
      'Assignees', 'Groups', 'Priority', 'Status', 'Milestone'],
      ranges: ['date'] }
      // var str = 'humvee in:name type:texture,lookdev'.replace(/\s+/g, ' ')
      var allQoutedStrs = q.match(/"([^"]*)"|'([^']*)'/g) || []
      allQoutedStrs.map((item) => {
        q = q.replace(new RegExp(item, 'g'), item.replace(/\s/g, '+'))
      })

      var newSearchQuery = searchQuery.parse(q, options)
      try {
        for (var key in newSearchQuery) {
          if (options.keywords.indexOf(key) > -1) {
            if (Array.isArray(newSearchQuery[key])) {
              newSearchQuery[key] = newSearchQuery[key].map((item) => {
                var tmp = item.replace(/['"]+/g, '').replace(/\+/g, ' ')
                return dict[tmp] || tmp
              })
            } else {
              var tmp = newSearchQuery[key]
                          .replace(/['"]+/g, '')
                          .replace(/\+/g, ' ')
              newSearchQuery[key] = dict[tmp] || tmp
            }
          }
        }
      } catch (e) {
        return callback(e.name + ': ' + e.message)
      }

      const searchFilter = {
        where: {
          project: newSearchQuery.Project
        }
      }

      var _filter = filterBuilder(searchFilter, newSearchQuery)

      _filter.includeLatestMilestone = true
      _filter = _.assign({}, ctx.query.filter, _filter)

      if (_filter.where.milestone && !_filter.where.assignees) {
        const milestoneQuery = _filter.where.milestone || null
        delete _filter.where.milestone

        Entity.app.models.Milestone.find({ where: { title: milestoneQuery } })
          .then((milestones) => {
            const ids = milestones.map((item) => item.id)
            const filter = {
              where: {
                'source.link_type': 'Milestone',
                'source.id': { inq: ids }
              }
            }
            Entity.app.models.Link.find(filter)
              .then((links) => {
                const entityIds = _.uniq(links.map((item) => item.target.id))
                _filter.where.id = { inq: entityIds }
                Entity.find(_filter, callback)
              })
              .catch(callback)
          })
          .catch(callback)
      } else if (_filter.where.assignees && !_filter.where.milestone) {
        var userFilter = _filter.where.assignees.like
          .split('|')
          .map((item) => ({ username: item }))

        Entity.app.models.User.find({ where: { or: userFilter } })
          .then((users) => {
            var userIds = users.map((item) => item.id)
            Entity.app.models.TaskAssignment.find(
              {
                where: {
                  userId: { inq: userIds },
                  project: _filter.where.project.like
                },
                include: {
                  relation: 'entity',
                  scope: {
                    include: 'assignees',
                    includeLatestMilestone: true
                  }
                }
              })
              .then((taskAssignments) => {
                callback(null, taskAssignments.map((item) => item.entity()))
                /* or do item.toJSON().entity*/
              })
              .catch(callback)
          })
          .catch(callback)
      } else if (_filter.where.assignees && _filter.where.milestone) {
        const milestoneQuery2 = _filter.where.milestone || null
        delete _filter.where.milestone

        const milestoneFilter = { where: { title: milestoneQuery2 } }

        Entity.app.models.Milestone.find(milestoneFilter)
          .then((milestones) => {
            var ids = milestones.map((item) => item.id)
            const filter = {
              where: {
                'source.link_type': 'Milestone',
                'source.id': { inq: ids }
              }
            }

            Entity.app.models.Link.find(filter)
              .then((links) => {
                var entityIds = _.uniq(links.map((item) => item.target.id))
                var userFilter = _filter.where.assignees.like
                                    .split('|')
                                    .map((item) => ({ username: item }))

                Entity.app.models.User.find({ where: { or: userFilter } })
                  .then((users) => {
                    var userIds = users.map((item) => item.id)

                    var query = {
                      where: {
                        userId: { inq: userIds },
                        entityId: {
                          inq: entityIds
                        },
                        project: _filter.where.project.like
                      },
                      include: {
                        relation: 'entity',
                        scope: {
                          include: 'assignees',
                          includeLatestMilestone: true
                        }
                      }
                    }

                    Entity.app.models.TaskAssignment.find(query)
                      .then((taskAssignments) => {
                        const result = taskAssignments
                                          .map((item) => item.entity())

                        callback(null, result)
                      })
                      .catch(callback)
                  })
                  .catch(callback)
              })
              .catch(callback)
          })
          .catch(callback)
      } else {
        Entity.find(_filter, callback)
      }
    })
  }

  Entity.remoteMethod('querySearch', entityRemoteMethods.querySearch)

  /**
   * Entity.createDependency
   * Create a new Entity instance, setting it as a dependency of this Entity.
   *
   * @param  {any}      id       Entity id
   * @param  {object}   data     new Entity instance data
   * @param  {Boolean}  isChild  when true, the new Entity will inherit the path
   *                             and root of this Entity
   * @param  {Function} callback called with Error or the new Entity
   */
  Entity.createDependency = function (id, data, isChild, callback) {
    console.log('\n\n')
    console.log(id, data, isChild)
    console.log(Entity.findById)
    Entity.findById(id, function (err, entity) {
      if (err) { return callback(err) }
      if (!entity) { return callback(null, null) }
      // the new Entity may inherit its path from this Entity - like so:
      // new path = old path / new type / new name

      if (_.isArray(data)) {
        var tasks = data.map(($data) => {
          return createEntityDependence.bind(createEntityDependence,
            Entity,
            entity,
            id,
            $data,
            isChild
          )
        })
        async.parallel(
          tasks,
          callback
        )
      } else {
        createEntityDependence(Entity, entity, id, data, isChild, callback)
      }
    })
  }

  Entity.createDependency.remoting = {
    before: function (ctx, inst, next) {
      logger.info('createDependency:before')
      next()
    },
    after: function (ctx, inst, next) {
      logger.info('createDependency:after')
      next()
    }
  }

  Entity.remoteMethod('createDependency', entityRemoteMethods.createDependency)

  Entity.remoteMethod('tree', {
    description: 'Get tree upwards',
    accepts: [{
      arg: 'id',
      type: 'any',
      description: 'Entity id',
      http: {
        source: 'path'
      }
    }],
    returns: {
      arg: 'data',
      type: 'Entity',
      root: true
    },
    http: {
      verb: 'get',
      path: '/:id/tree'
    }
  })

  Entity.tree = function (id, callback) {
    Entity.getUpTree(id, (err, nodes) => {
      if (err) { return callback(err) }
      var ids = nodes.map((node) => node.source.id)
      ids.push(id)
      Entity.find({ where: { id: { inq: ids } } }, callback)
    })
  }

  Entity.getUpTree = function getUpTree (targetId, cb) {
    var Link = Entity.app.models.Link
    var nodes = []
    var leaf = {}

    async.whilst(
      () => {
        if (nodes.length > 0 && leaf.source.category ===
          constants.ENTITY_TYPE_PROJECTS) {
          return false
        }
        if (nodes.length > 0) {
          targetId = leaf.source.id
        }
        return true
      },
      (callback) => {
        const filter = {
          where: {
            'target.id': targetId,
            'source.link_type': 'hierarchy'
          }
        }

        Link.findOne(filter)
          .then((link) => {
            nodes.push(link)
            leaf = link
            callback()
          })
          .catch(callback)
      },
      (err) => {
        if (err) { return cb(err) }
        // 5 seconds have passed
        // console.log('getUpTree(id, cb): err', err)
        cb(null, nodes)
      }
    )
  }
}

function createEntityDependence (Entity, entity, id, data, isChild, callback) {
  if (isChild) {
    data.root = entity.root
    // data.project = entity.name
    if (!data.name) {
      /* TODO: create a ValidationError */
      return callback(new Error('`name` not found in the body'), null)
    }
    if (!data.type) {
      /* TODO: create a ValidationError */
      return callback(new Error('`type` not found in the body'), null)
    }

    if (data[constants.CONSTANT_CATEGORY] ===
      constants.ENTITY_TYPE_ASSETS) {
      data.path = path.join(entity.path, data.type,
        utils.slugify(data.name))
    } else {
      data.path = path.join(entity.path, data.type,
        utils.slugify(data.name))
    }
  } else {
    if (entity[constants.CONSTANT_CATEGORY] ===
      constants.ENTITY_TYPE_PROJECTS) {
      var nonChildPath = path.join(entity.root, entity.type, entity.name,
        data.category, data.type, utils.slugify(data.name))

      data.path = nonChildPath
    }
  }

  if (!data.project || data.project === '') {
    data.project = entity.project
  }

  Entity.upsert(data, function (err, newEntity) {
    if (err) { return callback(err) }
    // create a dependency Link between this Entity and the new Entity.
    var source = {
      link_type: 'hierarchy',
      id: id,
      category: entity.category
    }
    var target = {
      link_type: 'hierarchy',
      id: newEntity.id,
      category: newEntity.category
    }

    Entity.app.models.Link.create({
      source: source,
      target: target,
      label: 'dependency'
    }, function (err) {
      callback(err, newEntity)
      return
    })
  })
}

function createActivity (verb, instance, modelName, next) {
  instance.activities.create({
    subject: instance.createdBy,
    verb: verb,
    indirectObject: {
      text: prependArticle(modelName),
      model: modelName,
      fk: instance.getId()
    },
    at: instance.createdAt
  }, propagateActivity(instance, next))
}

function prependArticle (word) {
  var vowels = ['a', 'e', 'i', 'o']
  var result = ''
  if (~vowels.indexOf(word[0].toLowerCase())) {
    result = 'an ' + word
  } else {
    result = 'a ' + word
  }

  return result
}

function propagateActivity (originator, next) {
  return function (err /*, activities*/) {
    if (err) { return next(err) }
    next()
  }
}
