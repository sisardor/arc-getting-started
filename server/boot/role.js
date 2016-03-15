// var debug = require('debug')('mavis:boot:roles');

module.exports = function(app) {
	/*
   * The `app` object provides access to a variety of LoopBack resources such as
   * models (e.g. `app.models.YourModelName`) or data sources (e.g.
   * `app.datasources.YourDataSource`). See
   * http://docs.strongloop.com/display/public/LB/Working+with+LoopBack+objects
   * for more info.
   */
	// {"where":{"name":"admin"},"include":{"relation":"entityAcls",
	// "scope":{"where":{"category":"projects"}}}}

	var Role = app.models.Role;
	// Role.hasMany(app.models.EntityACL, {as: 'entityAcls', foreignKey: 'roleId'});
	// // var User = app.models.User;
	// // User.hasMany(Role, {as:'roles', foreignKey:''});

};
