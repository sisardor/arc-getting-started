var log = require('debug')('mavis:socket:zmq');
process.title='Mavis Zmq'
log(process.argv[2])
var str = 'Sup dawg!';

process.on('message', function(m) {
	log('CHILD got message:', m);
});

var zmq = require('zmq')
var subscriber = zmq.socket('sub')

subscriber.on('message', function() {
  var msg = [];
    Array.prototype.slice.call(arguments).forEach(function(arg) {
        msg.push(arg.toString());
    });
    log(msg);
    process.send({msg:'message', data:msg});
})

subscriber.connect('tcp://localhost:5563')
subscriber.subscribe(process.argv[2] || 'B')



process.send({msg:'online', data: process.pid})

process.on('SIGINT', function() {
	log('****************** closing zmq')
  subscriber.close();
});
