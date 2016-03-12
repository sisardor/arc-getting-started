/* global log4js */
var log = require('debug')('mavis:socket:handler');
var logger = log4js.getLogger('mavis-socket-handler/index.js');
var zmq = require('zmq');
var subscriber = zmq.socket('sub');
// [
//    "chat message",
//    {
//       "command":"plate_publish.py",
//       "title":"Publish plate",
//       "description":"Publish plate",
//       "createdBy":"chris",
//       "createdAt":"2015-07-29T18:30:08.960Z",
//       "type":"publish",
//       "scriptType":"external",
//       "interpreter":"/Applications/Nuke9.0v6/Nuke9.0v6.app/Contents/MacOS/Nuke9.0v6 -nc -t",
//       "args":[
//          "--entities=1,14,53",
//          "--importFilepath=/mnt/x3/client_imports/andreasImports/plates/HoudiniTest_Sphere_Render.%04d.exr",
//          "--outputPath=/mnt/x3/projects/test001/projects/andreas_TEST/assets/plates/test_plate/v002.001"
//       ],
//       "priority":5,
//       "entityId":53,
//       "publishId":3,
//       "user":{
//          "username":"chris",
//          "email":"chris@hydraulx.com",
//          "id":4,
//          "firstName":"CJ admin",
//          "lastName":"Johnson"
//       },
//       "progress":{
//       		"text":"9 out of 10",
//       		"percentage":90
//       	}
//    }
// ]
var SocketHandler = (function () {
	// Instance stores a reference to the Singleton
	var instance;

	function init() {
		// var child = require('child_process').fork(__dirname + '/child.js');
		// child.on('message', function(m) {
		// 	if (m.msg === 'online') {
		// 		console.log(m)
		// 		log('worker %s online');
		// 	} else {
		// 		console.log(m);
		// 		io.emit('chat message', m.data);
		// 	}
		// });

		// child.send({ hello: 'world' });
		subscriber.connect('tcp://localhost:5563');
		subscriber.subscribe('ON_PUBLISH');
		subscriber.subscribe('PUBLISH_PROGRESS');
		subscriber.subscribe('FAIL');
		subscriber.on('message', function() {
			var messages = Array.prototype.slice.call(arguments);
			var code = messages[0].toString();
			var task = JSON.parse(messages[1].toString());

			if (code === 'ON_PUBLISH') {
				io.emit('ON_PUBLISH', task);
			}
			else if(code === 'PUBLISH_PROGRESS') {
				logger.info(code, task.progress)
				io.emit('ON_PUBLISH_PROGRESS', task);
			}
			else if(code === 'FAIL') {
				io.emit('ON_PUBLISH_FAIL', task);
			}


		});


		var io = require('socket.io')();
		// var redis = require('socket.io-redis');
		// io.adapter(redis({ host: 'localhost', port: 6379 }));
		io.on('connection', function( socket ) {
			// actionManager.initSub(callback);
			log('user connected');

			socket.on('subscribe', function(channel) {
				// actionManager.sub(channel);
				log('sub to channel `%s`', channel);
				socket.join(channel);
			});

			socket.on('disconnect', function() {
				log('user disconnected');
			});

			socket.on('chat message', function(msg) {
				logger.debug('message: ' + msg);
				io.emit('chat message', msg);
			});

			socket.on('send', function(data) {
				log('sending message', data);
				io.sockets.in(data.room).emit('message', { data: data } );
			});

		});

		function callback(reply) {
			var res = reply.toString();
			log(io.sockets.in)

			if(reply[0] === 'A') {
				log('Received reply', ': [', res, ']');
				io.sockets.in('A').emit('channel_A', 'channel A response ' + reply[1])
				//io.emit('chat message', res);
			}

			if(reply[0] === 'B') {
				log('Received reply', ': [', res, ']');
				io.sockets.in('B').emit('channel_B', 'channel B response ' + reply[1])
			}
		}

		// Private methods and variables
		function privateMethod(){
			log( 'I am private' );
		}



		return {

			// Public methods and variables
			publicMethod: function () {
				log( 'The public can see me!' );
			},
			attach: function(http) {
				log( 'I am private' );
				io.attach(http);
			},
			send: function(data) {
				// log('sending message', data);
				io.sockets.in('onPublish').emit('onPublish',  data )
				// io.emit('chat message', { data: data });
			},
			publicProperty: 'I am also public'
		};

	}

	return {
		getInstance: function () {
			if ( !instance ) {
				instance = new init();
			}

			return instance;
		}
	};
})();

module.exports = SocketHandler.getInstance();
