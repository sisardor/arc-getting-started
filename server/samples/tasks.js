// var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Task')

var fs = require('fs')
var parse = require('csv-parse')
var path = require('path')

module.exports = function (app,  cb) {
  var Entity = app.models.Entity
  var User = app.models.User
  logger.info('hello')
  cb()

  // Entity.find({})
  //   .then(entities => {
  //     User.find({})
  //       .then(users => {
  //         logger.info(users)
  //       })
  //       .catch(err => {
  //         logger.error(err)
  //       })
  //   })
  //   .catch(err => {
  //     logger.error(err)
  //   })
  // return

//   app.models.User.find({}, function(err, users) {
//   if (err) {
//     console.error(err)
//     return next(err)
//   }
//
//   if (!users || !users.length || users.length == 0) {
//     log('linkUsersToTasks: no users', users)
//     next()
//   }
//
//   var task_assginess = []
//   var groups = provisionedEntities.groups
//   var tasks = provisionedEntities.tasks
//
//   if (tasks && tasks.length && tasks.length !== 0) {
//
//     for (var i = 0 i < 10 i++) {
//       var userId = users[Math.floor(getRandomArbitrary(1,20))].id
//       var entity = groups[Math.floor(getRandomArbitrary(1,groups.length-1))]
//
//       task_assginess.push({entityId: entity.id, project:entity.project, userId: userId})
//     }
//     for (var i = 0 i < 40 i++) {
//       var userId = users[Math.floor(getRandomArbitrary(1,20))].id
//       var entity = tasks[Math.floor(getRandomArbitrary(1,tasks.length-1))]
//       task_assginess.push({entityId: entity.id, project:entity.project, userId: userId})
//     }
//     app.models.TaskAssignment.create(task_assginess, next)
//   }
// })
}
