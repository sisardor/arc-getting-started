var constants = require('../../common/helpers/constants')
var logger = require('tracer').colorConsole()
var debug = require('debug')('mavis:provisioning:Action')

module.exports = function (app) {
  /*
   * The `app` object provides access to a variety of LoopBack resources such as
   * models (e.g. `app.models.YourModelName`) or data sources (e.g.
   * `app.datasources.YourDataSource`). See
   * http://docs.strongloop.com/display/public/LB/Working+with+LoopBack+objects
   * for more info.
   */
  var data = {
    'command': 'plate_publish.py',
    'title': 'Publish plate',
    'description': 'Publish plate',
    'createdBy': 'chris',
    'type': 'publish',
    'scriptType': 'external',
    'interpreter': '/Applications/Nuke9.0v8/Nuke9.0v8.app/Contents/MacOS/Nuke9.0v8 -nc -t',
    'args': [
     {'name': 'inputStartFrame'},
     {'name': 'startFrame'},
     {'name': 'endFrame'},
     {'name': 'inputColorSpace'},
     {'name': 'inputX'},
     {'name': 'inputY'},
     {'name': 'head'},
     {'name': 'tail'}
    ],
    'priority': 5
  }
  app.models.EntityType.findById(constants._$PLATES, (err, entityType) => {
    if (err) { logger.error(err) }
    entityType.onPublish.create(data, (err, actions) => {
      if (err) { logger.error(err) }
      debug('Created `Action`', actions)
    })
  })

  var data2 = {
    'command': 'camera_publish.py',
    'title': 'Camera publish',
    'description': 'Camera publish',
    'createdBy': 'chris',
    'type': 'publish',
    'scriptType': 'external',
    'interpreter': '/Applications/Nuke9.0v8/Nuke9.0v8.app/Contents/MacOS/Nuke9.0v8 -nc -t',
    'args': [
      {'name': 'priority'},
      {'name': 'status'},
      {'name': 'grouping'},
      {'name': 'comp_status'},
      {'name': 'prod_status'}
    ]
  }
  app.models.EntityType.findById(constants._$CAMERA, (err, entityType) => {
    if (err) { logger.error(err) }
    entityType.onPublish.create(data2, (err, actions) => {
      if (err) { logger.error(err) }
      debug('Created `Action`', actions)
    })
  })
}
