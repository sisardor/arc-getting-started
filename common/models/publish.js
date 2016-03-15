/* jslint node: true,  white: true, unparam: true */ /* global log4js */
/* jshint unused: true, node: true */
'use strict'
var util = require('../helpers/util')
var FileManager = require('../../lib/mavis-fs-manager')
var logger = log4js.getLogger('publish.js')
var zmq = require('zmq')
var subscriber = zmq.socket('sub')
var constants = require('../helpers/constants')
var path = require('path')

module.exports = function (Publish) {
  subscriber.connect('tcp://localhost:5563')
  subscriber.subscribe('ON_PUBLISH')
  subscriber.subscribe('FAIL')
  subscriber.on('message', function () {
    var messages = Array.prototype.slice.call(arguments)
    var code = messages[0].toString()
    var task = JSON.parse(messages[1].toString())

    if (code === 'ON_PUBLISH') {
      logger.info('create symlink for at %s', task.publishId)
      logger.info('Task for entity `%s` has finished', task.entityId)
      Publish.findById(task.publishId, function (err, publish) {
        if (err) { return }

        logger.info('\n\n' + JSON.stringify(publish, null, 2) + '\n\n')

        FileManager.symlinkVersion(
          publish.path, // src
          publish.source + '/MASTER', // destination TODO: publish.source shouldn't init here
          function (err, res) {
            if (err) {
              throw new Error(err)
            }

            if (res === publish.path) {
              publish.confirmed = true
              // publish.save()

              Publish.update(publish)
              logger.info('SUCCESS')
              Publish.app.models.Activity.emit('publish', publish)
            }
          }
        )

        return
      })
    } else if (code === 'FAIL') {
      logger.error('code : `%s`\n%s', code, JSON.stringify(task, null, 2))
    }
  // TODO:
  // - create symlink
  // - create activtiy
  // - notify Entities, Tasks, Users
  })

  Publish.observe('before save', function (ctx, next) {
    var _entityFilter = {
      include: [
        { EntityType: [ 'onPublish', 'commonFields', 'customFields' ] },
        { relation: 'publishes', scope: { limit: 1, order: 'createdAt DESC' } }
      ]
    }

    if (ctx.isNewInstance) {
      ctx.Model.app.models.Entity.findById(ctx.instance.entityId, _entityFilter, function (err, entity) {
        if (err) { return next(err) }
        logger.info('[before save]: Number of publishes for Entity#`%s`: %s', ctx.instance.entityId, entity.publishes().length)

        if (entity.publishes().length) {
          var publish = entity.publishes()[0]

          if (!ctx.instance.isMajorVersion) {
            publish.minor++
          } else {
            publish.major++
            publish.minor = 0
          }

          ctx.instance.major = publish.major
          ctx.instance.minor = publish.minor
        } else {
          ctx.instance.major = 0
          ctx.instance.minor = 0

          if (ctx.instance.isMajorVersion) {
            ctx.instance.major++
          } else {
            ctx.instance.minor++
          }
        }

        ctx.instance.version = 'v' + util.pad(ctx.instance.major, 3) + '.' + util.pad(ctx.instance.minor, 3)
        ctx.instance.source = entity.path
        ctx.instance.path = path.join(ctx.instance.source, ctx.instance.version)
        ctx.hookState.action = ctx.instance.isMajorVersion ? 'PUBLISH_MAJOR' : 'PUBLISH_MINOR'
        ctx.hookState.payload = entity

        // Make directory
        FileManager.mkdir(ctx.instance.path, function (err) {
          if (err) return next(err)
          logger.info('[before save]: mkdir success')
          next()
        })
      })
    } else { // ctx.currentInstance
      // TODO: we need to test this few time, sometimes ctx.data is undefined
      if (ctx.data.hasOwnProperty('confirmed') && ctx.data.confirmed !== ctx.currentInstance.confirmed) {
        logger.info('[before save]: PUT update master symlink')
        ctx.hookState.action = constants.UPDATE_MASTER_SYMLINK
      }

      next()
    }
  })

  /**
   * Emit publish activity to Activity model
   * @param  {Object} ctx     strongloop context
   * @param  {Func} next  callback
   * @return {void}
   */ // TODO: implement update logic
  Publish.observe('after save', function (ctx, next) {
    // logger.debug('after save: create directory for path `%s`', ctx.instance.path)

    if (ctx.isNewInstance) {
      // if (ctx.hookState.action === 'PUBLISH_MAJOR') {
      //  var id = ctx.hookState.payload.id
      //  ctx.Model.app.models.Entity.getUpTree(id, function(err, nodes) {
      //    if(err) return next(err)
      //    var ids = [id]
      //    nodes.forEach(function(item){
      //      if(item.source.category === constants.ENTITY_TYPE_GROUPS
      //        || item.source.category === constants.ENTITY_TYPE_PROJECTS) {
      //        ids.push(item.source.id)
      //      }
      //    })

      //    var actions = ctx.hookState.payload.EntityType().onPublish()
      //    var error
      //    if (!actions || actions.length === 0) {
      //      error = new Error('Entity "' + id + '" has no "onPublish" Actions.')
      //      error.statusCode = error.status = 404
      //      return next()
      //    }

      //    actions[0].__publish2(ctx.hookState.payload, ctx.instance, ids, next)
      //  })
      // }
      // else {

      // }
      next()
    } else next()
  })

  Publish.observe('after save', function (ctx, next) {
    if (ctx.hookState.action === constants.UPDATE_MASTER_SYMLINK) {
      logger.info('[after save]: ACTION - UPDATE_MASTER_SYMLINK')
      FileManager.symlinkVersion(
        ctx.instance.path, // src
        path.join(ctx.instance.source, constants.MASTER), // destination TODO: publish.source shouldn't init here
        function (err, res) {
          if (err) return next(err)
          if (res === ctx.instance.path) {
            Publish.app.models.Activity.emit('publish', ctx.instance)
          }

          next()
        }
      )
    } else next()
  })
}
