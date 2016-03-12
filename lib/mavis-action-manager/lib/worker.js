/* global process */
var spawn = require('child_process').spawn
var path = require('path')
var configPath = './mavis-config.' + process.env.NODE_ENV + '.yml'
var config = require('yamljs').load(configPath)
var CONFIG_PATH = _$MAVIS_CONFIG.scripts_directory_path

function Worker (callback) {
  return ({
    action: function (msg, task) {
      callback(msg, task)
    },
    errors: [],
    send: function () { /* TODO: implement protocol */},
    spawn: function (task) {
      var command
      var args
      command = task.command[0] == '/' ? task.command : CONFIG_PATH + '/' + task.command

      // command = path.normalize(command)

      args = task.args.slice()

      if (task.interpreter) {
        // all args: the interpreter, interpreter flags, command, command args.
        args = task.interpreter.split(' ')
        args.push(command)
        args = args.concat(task.args)
        // shift off the interpreter, which becomes the actual command to run.
        command = args.shift()
      }
      else args = task.args.slice()

      console.log('\n----------Action.Manager worker.spawn()-----------')
      console.log(command)
      console.log(args)
      console.log('\n')

      try {
        this.taskprocess = spawn(command, args, {
          stdio: ['ignore', 'pipe', 'pipe', 'pipe']
        })
      } catch (e) {
        // statements to handle any exceptions
        console.log(e) // pass exception object to error handler
      }

      var logID = '1771'
      this.taskprocess.stdout.on('data', this.log.bind(this, logID))
      this.taskprocess.stderr.on('data', this.errorHandler.bind(this, logID))
      this.taskprocess.on('close', this.close.bind(this))
      this.taskprocess.stdio[3].on('data', this.progress.bind(this, logID))

      this.task = task
    },
    progress: function (id, data) {
      var parsedJson = null
      try {
        parsedJson = JSON.parse(data.toString())
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.log(e)
          console.log('NOT JSON')
        }
      }

      if (parsedJson) {
        parsedJson.id = id
        this.task.progress = parsedJson
        callback('PROGRESS', this.task)
      }
    },
    log: function (id, data) {
      // console.log(data.toString())
      this.action('LOGS', {id: id, data: data.toString() })
    },
    errorHandler: function (id, data) {
      this.errors.push(data.toString())
    },
    kill: function () {
      this.taskprocess.kill('SIGABRT')
    },
    close: function (code, signal) {
      if (this.errors) {
        this.task.error = this.errors.join('')
      }
      var task = this.task
      delete this.task
      delete this.taskprocess

      // handle a user-aborted task.
      if (signal == 'SIGABRT') return

      // simple pass/fail return code handling - may need refinement later...
      if (code === 0) {
        // parse the return value (otherwise is double-stringified when
        // serialized in lib/message).

        this.action('SUCC', task)
      } else {
        this.action('FAIL', task)
      }
    }
  })
}

module.exports = Worker

// var _Worker = require('./lib/worker')
// var worker = new _Worker()
// worker.spawn({command: '/Users/zeromax/Development/mavis/python/tmp.py',args: [ '--entityId=77', '--platepath=/hdx/projects/andreas/plates', '--colorspace=Linear', '--xres=1920', '--yres=1080', '--aspect=1.0']})
