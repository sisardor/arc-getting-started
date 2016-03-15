'use strict'
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Task')
var constants = require('../../common/helpers/constants')

module.exports = function (app) {
  var Entity = app.models.Entity
  var User = app.models.User

  Entity.find().then(entities => {
    User.find().then(users => {
      if (users.length === 0) {
        logger.warn('no users')
      }
      debug(users, entities.length)
      functionName(entities, users)
    }).catch(err => {
      logger.error(err.stack)
      throw err
    })
  }).catch(err => {
    logger.error(err)
  })

  function functionName (entities, users) {
    const task_assginess = []
    let groups = entities.filter((item) => item.category ===
      constants.ENTITY_TYPE_GROUPS)
    let tasks = entities.filter((item) => item.category ===
      constants.ENTITY_TYPE_TASKS)

    function randomAssign (array, num) {
      for (let i = 0; i < users.length; i++) {
        let userId = users[i].id
        let average = Math.round(array.length * num)
        let entity = {}
        for (let j = 0; j < average; j++) {
          let tmp_ent = array[Math.floor(_random(1, array.length - 1))]
          entity[tmp_ent.id] = tmp_ent
        }
        for (let key in entity) {
          task_assginess.push({
            entityId: key,
            project: entity[key].project,
            userId: userId })
        }
      }
    }

    randomAssign(groups, 0.6)
    randomAssign(tasks, 0.5)

    app.models.TaskAssignment.create(task_assginess, (err, taskAss) => {
      if (err) {
        logger.error(err)
      }
      debug('Created `TaskAssignment`:', taskAss)
    })
  }
}

function _random (min, max) {
  return Math.random() * (max - min) + min
}

// { entityId: 3, project: 'geostorm', userId: 3, id: 2 },
// { entityId: 3, project: 'geostorm', userId: 1, id: 3 },
// { entityId: 3, project: 'geostorm', userId: 3, id: 5 },
// { entityId: 3, project: 'geostorm', userId: 3, id: 6 },
// { entityId: 3, project: 'geostorm', userId: 3, id: 7 },
// { entityId: 3, project: 'geostorm', userId: 3, id: 8 },
// { entityId: 3, project: 'geostorm', userId: 3, id: 9 },
