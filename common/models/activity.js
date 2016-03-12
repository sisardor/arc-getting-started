/* jslint node: true,  white: true, unparam: true */
/* jshint unused: true, node: true */ /*global log4js */
'use strict'
var SockerHanlder = require('../../lib/mavis-socket-handler')
var logger = log4js.getLogger('activity.js')

module.exports = function (Activity) {
  // Computed Defaults.
  Activity.definition.rawProperties.at.default =
    Activity.definition.properties.at.default = function () {
      return new Date()
    }

  /**
   * `publish` event is called from publish.js when new a publish
   * is created, operation hook `after save` will trigger this event
   */
  Activity.on('publish', function (instance) {
    logger.debug('new publish activity \t%s', JSON.stringify(instance))

    var activity = {
      subject: 'chris',
      verb: 'published',
      indirectObject: {
        text: 'an Publish',
        model: 'Publish',
        fk: instance.id
      },
      at: instance.createdAt,
      entityId: instance.entityId
    }

    Activity.create(activity, function (err, activity) {
      if (err) {
        logger.error(err)
        return
      }
      SockerHanlder.send(activity)
      logger.debug('activity instance \t%s', JSON.stringify(activity))
    })
  })
}
