/*jslint node: true,  white: true, unparam: true */
/*jshint unused: true, node: true */
'use strict';
var debug = require('debug')('mavis:boot:test');

module.exports = function(Note) {


	Note.observe('access', function(ctx, next) {
		var Role = ctx.Model.app.models.Role;
		// var RoleMapping = ctx.Model.app.models.RoleMapping;

		// Role.find(function(err, roles) {
		// 	debug('Role find');
		// 	console.log(roles);
		// 	next(err, roles);
		// });

		// Role.isInRole('artist', {principalType: 'USER', principalId: 1},
		// function(err, exists) {
		// 	debug('Role isInRole');
		// 	console.log(exists);
		// 	next(err, exists);
		// });
		Role.find(function(err, roles) {
			if (err) return next(err);
			debug('------------------ Role -----------------');
			next(err, roles);
		});
		// next();
	});
};
