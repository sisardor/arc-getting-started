var debug = require('debug')('mavis:provisioning:User')
module.exports = function(app) {
  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;


  User.create([
    {username: 'John', email: 'john@doe.com',     password: 'opensesame'},
    {username: 'Jane', email: 'jane@doe.com',     password: 'opensesame'},
    {username: 'Bob',  email: 'bob@projects.com', password: 'opensesame'}
  ], function(err, users) {
    if (err) throw err;

    debug('Created users: %j', users);

    //create the admin role
    Role.create({
      name: 'admin'
    }, function(err, role) {
      if (err) throw err;
    });
  });
};