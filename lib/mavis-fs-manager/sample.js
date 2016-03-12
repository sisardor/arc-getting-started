var FileManager = require('./index');
var fs = require('fs');
var os = require('os');

// FileManager.scan("/mnt/users/sisakov", 1, function(err, flist) {
// 	console.log(flist)
// });
// return;

FileManager.readdir('/mnt/users/sisakov/tmp', function(err, array) {
	if (err) throw err;

	console.log(array) // array of file and dir names
	var response = [];
	array.forEach(function(path) {
		var res = FileManager.isDirectory('/mnt/users/sisakov/tmp/' +  path);
		response.push({ path: path, isDirectory: res });
	})

	console.log({
		directory: '/mnt/users/sisakov/tmp',
		content: response
	});

	FileManager.mkdir('/mnt/users/sisakov/tmp/fooX/bar/baz', function(err) {
		console.log('----------------------')
		if (err) console.error(err)
		else console.log('pow!')
	});

	fs.stat('/mnt/users/sisakov/tmp/small.mp4', function(err, stats) {
		console.log('----------------------')
		if (err) console.error(err);
		console.log(stats)
		console.log("isDirectory: " + stats.isDirectory())
	})

	fs.rmdir('/mnt/users/sisakov/tmp/foo/bar/baz', function(err, res) {
		console.log('----------------------')
		if (err) console.error(err);
		console.log(res)
	})
	console.log("tmpdir: " + os.tmpdir() +
		"\nhostname: " + os.hostname() +
		"\ntype: " + os.type() +
		"\nplatform: " + os.platform() +
		"\nrelease: " + os.release());
	console.log(os.networkInterfaces())


});


FileManager.scan("/mnt/users/sisakov/tmp", 4, true, function(err, flist) {
	console.log('------------find----------')
	console.log(flist)
});

FileManager.copy('/mnt/users/sisakov/tmp/small.mp4', '/mnt/users/sisakov/tmp/small-copy.mp4');

// fs.lstat('/mnt/users/sisakov/.ICEauthority', function(err, stats) {
// 	if(err) { throw err; }
// 	console.log(stats.isDirectory())
// });
