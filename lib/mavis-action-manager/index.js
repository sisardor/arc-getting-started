var debug = require('debug')('mavis:socket:action-manager')
var _Worker = require('./lib/worker')
var logger = log4js.getLogger('mavis-action-manager')

var mySingleton = (function () {
  // Instance stores a reference to the Singleton
  var instance

  function init () {
    var TCP_ADDRESS = 'tcp://*:5565'
    var zmq = require('zmq')
    var publisher = zmq.socket('pub')

    publisher.bind(TCP_ADDRESS, function (err) {
      if (err)
        logger.info(err)

      else
        logger.info('zeromq is listening on %s', TCP_ADDRESS)

    })

    var callback = function (msg, task) {
      switch (msg) {
        case 'SUCC':
          logger.info('SUCCESS')
          publisher.send(['ON_PUBLISH', JSON.stringify(task)])
          break
        case 'PROGRESS':
          publisher.send(['PUBLISH_PROGRESS', JSON.stringify(task)])
          break
        case 'FAIL':
          if (task.error) logger.error('action failed:\n', task.error)
          publisher.send(['FAIL', JSON.stringify(task)])
          break
      }
    }

    return {
      send: function (message) {
        if (!message)
          message = 'ping'

        debug('sending message to ZMQ at %s', TCP_ADDRESS)
        publisher.send(message)
      },

      submitAction: function (task) {
        new _Worker(callback).spawn(task)
      },
    }
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = init()
      }
      return instance
    }

  }

})()

module.exports = mySingleton.getInstance()
