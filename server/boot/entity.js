var loopback 	= require('loopback')

module.exports = function entitySetUp(server) {
	var Entity 		= server.models.Entity
	var TaskAssignment = server.models.TaskAssignment
	var User 		= server.models.User
	var UserPreference 		= server.models.UserPreference

	var UserFilter  = server.models.UserFilter
	var Filter 		= server.models.Filter

	server.models.User.settings.acls = require('../user-acls.json')

	Entity.sharedClass.find('create', true).shared = false
	Entity.sharedClass.find('upsert', true).shared = false


	TaskAssignment.belongsTo(User, {foreignKey: 'userId'})
	TaskAssignment.belongsTo(Entity)

	Entity.hasMany(User, {through: TaskAssignment, as: 'assignees'})
	User.hasMany(Entity, {through: TaskAssignment})



	var Avatar = server.registry.modelBuilder.define('Avatar', {avatar: String })
	User.mixin(Avatar)
	// User.validate('avatar', customValidator, {message: 'User@avatar does not contain url'})
	// function customValidator(err) {
	// 	if(this.avatar && !this.avatar.hasOwnProperty('url')) {
	// 		err()
	// 	}
	// }


	UserFilter.belongsTo(User)
	UserFilter.belongsTo(Filter)

	User.hasMany(Filter, {through: UserFilter})
	Filter.hasMany(User, {through: UserFilter})




	var Comment 		= server.models.Comment
	var Reference 		= server.models.Reference
	var Objective 		= server.models.Objective

	Entity.hasMany(Reference, { polymorphic: 'referable' })
	Comment.hasMany(Reference, { polymorphic: { // alternative syntax
		as: 'referable', // if not set, default to: reference
		foreignKey: 'referableId', // defaults to 'as + Id'
		discriminator: 'referableType' // defaults to 'as + Type'
	} })
	Objective.hasMany(Reference, { polymorphic: { // alternative syntax
		as: 'referable', // if not set, default to: reference
		foreignKey: 'referableId', // defaults to 'as + Id'
		discriminator: 'referableType' // defaults to 'as + Type'
	} })
}
