/*jslint node: true,  white: true, unparam: true *//* global log4js */
/*jshint unused: true, node: true */
'use strict';
var util = require('../helpers/util');
var debug = require('debug')('mavis:models:action');
var FileManager = require('../../lib/mavis-fs-manager');
var ActionMngr = require('../../lib/mavis-action-manager');
var path = require('path');
var logger = require('tracer').colorConsole()
var loopback = require('loopback');
var zmq = require('zmq');
var _ = require('lodash')





module.exports = function(Action) {
	// var subscriber = zmq.socket('sub');
	// var CONST_SUCCESS = 'SUCCESS';
	// var config = _$MAVIS_CONFIG;

	// subscriber.connect('tcp://localhost:5563');
	// subscriber.subscribe('ON_PUBLISH');
	// subscriber.on('message', function() {
	// 	var messages = Array.prototype.slice.call(arguments);
	// 	var code = messages[0].toString();
	// 	var task = JSON.parse(messages[1].toString());

	// 	if(code === 'ON_PUBLISH') {
	// 		logger.info('Task for entity `%s` has finished', task.entityId);
	// 	} else if(code === 'FAIL') {
	// 		logger.error('code : `%s`', code);
	// 	}
	// });















	Action.observe('before save', function beforeSave(ctx, next) {
		if (ctx.instance) {
			if (!ctx.instance.command) {
				ctx.instance.command = util.slugify(ctx.instance.title);
			}
		}
		next();
	});




	// /**
	//  * __publish function executes 3rd party script from code, it passes
	//  * all necessary parameters to the script file
	//  * @param  {Object}   entity   [description]
	//  * @param  {Array}   ids       Array of ids of project, shot, and asset
	//  * @param  {Function} callback callback function
	//  * @return {Object}            if successfull retun publish json
	//  */
	// Action.prototype.__publish = function publish(entity, ids, callback) {
	// 	var json = {
	// 		'root': config.path_prefix,
	// 		'path': entity.path,
	// 		'source': entity.path,
	// 		'project': entity.project,
	// 		'isMajorVersion': false
	// 	};

	// 	// Create publish for given entity, @see publish.js
	// 	entity.publishes.create(json, function(err, publish){
	// 		if (err) { return callback(err); }
	// 		var Task = entity.EntityType().onPublish()[0];
	// 		var action = entity.EntityType().onPublish()[0];
	// 		var args = [];

	// 		// construct array of parameters for script
	// 		args.push( '--entity=' + entity.id);
	// 		if (entity.fileImportPath && entity.fileImportPath !== '') {
	// 			args.push( '--fileImportPath=' + entity.fileImportPath );
	// 		}

	// 		args.push( '--outputPath=' + publish.path );
	// 		args.push( '--entities=' + ids.toString());

	// 		var commonFields = entity.EntityType().commonFields()
	// 		var customFields = entity.EntityType().customFields()
	// 		var allFields = customFields.concat(commonFields);
	// 		var allFieldNames = allFields.map(function(item){
	// 			return item.name
	// 		})

	// 		var fieldArguments = [];
	// 		allFieldNames.forEach(function(item){
	// 			fieldArguments.push(  ['--', item, '=', entity.fields[item]].join('')  );
	// 		});




	// 		Task.entityId = entity.id;
	// 		Task.publishId = publish.id;
	// 		Task.user = loopback.getCurrentContext().get('currentUser');
	// 		Task.args = args.concat(fieldArguments);

	// 		logger.info('Submitting task for entity#`%s`\n%s', Task.entityId, JSON.stringify(Task, null, 2));

	// 		ActionMngr.submitAction(Task);
	// 		callback(null, CONST_SUCCESS);
	// 	});
	// };

	// Action.prototype.__publish2 = function publish2(entity, publish, ids, callback) {
	// 	var Task = entity.EntityType().onPublish()[0];
	// 	var action = entity.EntityType().onPublish()[0];
	// 	var args = [];

	// 	// construct array of parameters for script
	// 	args.push( '--entity=' + entity.id);
	// 	if (entity.fileImportPath && entity.fileImportPath !== '') {
	// 		args.push( '--fileImportPath=' + entity.fileImportPath );
	// 	}

	// 	args.push( '--outputPath=' + publish.path );
	// 	args.push( '--entities=' + ids.toString());

	// 	var commonFields = entity.EntityType().commonFields()
	// 	var customFields = entity.EntityType().customFields()
	// 	var allFields = customFields.concat(commonFields);
	// 	var allFieldNames = allFields.map(function(item){
	// 		return item.name
	// 	})

	// 	var fieldArguments = [];
	// 	allFieldNames.forEach(function(item){
	// 		fieldArguments.push(  ['--', item, '=', entity.fields[item]].join('')  );
	// 	});




	// 	Task.entityId = entity.id;
	// 	Task.publishId = publish.id;
	// 	Task.user = loopback.getCurrentContext().get('currentUser');
	// 	Task.args = args.concat(fieldArguments);

	// 	logger.info('Submitting task for entity#`%s`\n%s', Task.entityId, JSON.stringify(Task, null, 2));

	// 	ActionMngr.submitAction(Task);
	// 	callback(null, CONST_SUCCESS);
	// }

	// Action.prototype.__create = function create(entity, callback) {
	// 	var json = {
	// 		'root': config.path_prefix,
	// 		'path': entity.path ,
	// 		'source': entity.path,
	// 		'project': entity.project
	// 	};

	// 	entity.publishes.create(json, function(err, publish){
	// 		if (err) { return callback(err); }

	// 		var Task = entity.EntityType().onCreate()[0];
	// 		var action = entity.EntityType().onCreate()[0];
	// 		var args = [];
	// 		var entitiesArg = [];
	// 		entitiesArg.push(1); // project id
	// 		entitiesArg.push(14); // shot id
	// 		entitiesArg.push(entity.id);
	// 		var fileImportPath = path.join(config.import_directory_path, entity.fileImportPath);
	// 		args.push( '--entities=' + entitiesArg.toString());
	// 		if (entity.fileImportPath !== '')
	// 			args.push( '--fileImportPath=' + fileImportPath );
	// 		args.push( '--outputPath=' + publish.path );

	// 		Task.entityId = entity.id;
	// 		Task.publishId = publish.id;
	// 		Task.user = loopback.getCurrentContext().get('currentUser');
	// 		Task.args = args;

	// 		logger.info('Submit task for entity `%s`', Task.entityId);
	// 		// console.log(Task.user)

	// 		ActionMngr.submitAction(Task);
	// 		callback(null);
	// 	});

	// };


	// Action.importer = function( cb ) {
	// 	var importDirectory = config.import_directory_path;
	// 	debug(__dirname);
	// 	debug(config);
	// 	var resolvedPath = path.resolve( importDirectory );

	// 	FileManager.getSeq( resolvedPath, function(err, list) {
	// 		if (err) return cb(err, null);

	// 		debug(list);
	// 		var rr = list.map(function(file) {
	// 			return file.replace(resolvedPath, '');

	// 		});
	// 		cb(null, rr);
	// 	});

	// };

	// Action.remoteMethod( 'importer', {
	// 		description: ('Browse mavis import directory'),
	// 		returns: { type: 'object', root: true },
	// 		http: {path: '/fs/listImport', verb: 'get'},
	// 	}
	// );


	// Action.beforeRemote('**', function(ctx, user, next) {
	// 	debug(ctx.methodString, 'was invoked remotely');
	// 	next();
	// });
};
