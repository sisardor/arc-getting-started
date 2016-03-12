/*jslint node: true,  white: true, unparam: true */
/*jshint unused: true, node: true, strict: true */
/* global require */
'use strict';
var fs 		= require('fs-extra');
var mkdirp 	= require('mkdirp');
var search 	= require('./lib/search');
var async 	= require('async')
var lss 	= require('./lib/lss2')
// var logger = log4js.getLogger('mavis-fs-manager');
// var fmEntity = new FileManager.Entity(entity) Create a new instance of FileManager Entity, giving it metadata (an Entity instance) from the REST API.
// fmEntity.exists(callback) Check for the Entity's existence on disk.
// fmEntity.create(callback) Create any directories needed by the Entity.
// fmEntity.checksum(callback) Calculate a checksum for the Entity's file or directory.
// fmEntity.copy(path, callback) Copies the Entity to a new location on disk.
// fmEntity.move(path, callback) Moves the Entity to a new location on disk.
// fmEntity.publish(file, callback) If the Entity references a single file, the file argument is ignored, otherwise file represents a single file in the Entity's directory. That file is copied into a "publishes" directory, and its name is appended with the published version number.
// fmEntity.delete(callback) Removes the Entity from disk

module.exports = {
		mkdir: mkdir,
		removeDir: removeDir,
		readdir: readdir,
		isDirectory: isDirectory,
		scan: search.scan,
		copy: copy,
		move: move,
		delete: fs.remove,
		symlinkVersion: symlinkVersion,
		getSeq: getSequence,
		lss:lss
	};




function mkdir(path, callback) {
	// TODO: check if path already exists
	path = path.trim();
	if(!path) {
		var err = new Error('path cannot be empty')
		// logger.error(err);
		typeof callback === 'function' && callback(err);
		return;
	}

	mkdirp(path, function(err) {
		if(err) {
			// logger.error(err);
		}
		else {
			// logger.debug('created directory at `%s`', path);
		}
		typeof callback === 'function' && callback(err);
	});
}
function removeDir(path, callback) {
	fs.rmdir(path, callback);
}
function readdir(path, callback) {
	fs.readdir(path, callback);
}
function isDirectory(path) {
	try {
		var result = fs.lstatSync(path);
		return result.isDirectory();
	}
	catch (e) {
		return e;
	}
}
function copy(src, dest, callback) {
	(src, dest, callback); // copies file
}
function move(src, dest, callback) {
	fs.move(src, dest, callback);
}

function symlinkVersion(src, dest, callback) {
	fs.exists(dest, function(exists){
		if(exists) fs.unlinkSync(dest)
		fs.symlink(src, dest, 'dir', function(res) {
			fs.readlink(dest, callback)
		})
	});
}

// fm.readdir('/Users/zeromax/Development/mavis/misc/imports/andreasImports', function(err, ar){ console.log(ar) })


function getSequence(importDirectory, callback) {

	search.scan(importDirectory, 10, true, function(err, flist) {
		if(err) return callback(err);

		try {
			lss(flist, callback)
		} catch(e) {
			console.log(e)
			if (e instanceof TypeError) {
		        console.log('!!! ERROR TypeError')
		    } else if (e instanceof ReferenceError) {
		        console.log('!!! ERROR ReferenceError')
		    } else {

		    }
		}
	})
}


