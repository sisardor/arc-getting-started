var fs = require('fs');

exports.scan = function(dir, depth, isFile, done) {
   depth--;
   var results = [];
   fs.readdir(dir, function(err, list) {
	   if (err) return done(err);
	   var i = 0;
	   (function next() {
		   var file = list[i++];
		   if (!file) return done(null, results);
		   file = dir + '/' + file;
		   fs.stat(file, function(err, stat) {
			   if (stat && stat.isDirectory()) {
					if(!isFile)
				  		results.push(file);

				   	if (depth !== 0) {
					   	var ndepth = (depth > 1) ? depth-1 : 1;
					   	exports.scan(file, ndepth, isFile, function(err, res) {
						   	results = results.concat(res);
							next();
					   	});
				   	} else {
					   next();
				   	}
			   } else {
			   		if(isFile)
				  		results.push(file);

				   	next();
			   }
		   });
	   })();
   });
};