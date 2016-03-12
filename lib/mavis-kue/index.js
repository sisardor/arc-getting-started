



var kue = require('kue');
var jobs = kue.createQueue();


function newJob (name) {
	var job = jobs.create('new_job',{
		name: name
	});

	job
		.on('complete', function(){
			console.log('Job', job.id, 'with name', job.data.name, 'is done');
		})
		.on('failed', function(){
			console.log('Job', job.id, 'with name', job.data.name, 'is failed');
		})
	job.save();
}

jobs.process('new_job', function (job, done) {

	console.log(job.data)
	done && done();
})

setInterval(function(){
	newJob("Send_Email");
}, 3000);

setInterval(function(){
	newJob("Convert_Video");
}, 3000);