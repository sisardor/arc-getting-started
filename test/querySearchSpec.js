var chai = require('chai')
	, expect = chai.expect
	, sinon = require('sinon')
	, should = require('should')
	, assert = chai.assert;
var request = require('supertest')
chai.use(require('sinon-chai'));
require('mocha-sinon');
var searchQuery = require('search-query-parser');
var baseUrl = 'http://localhost:3000';
var token = null;
var filterBuilder = require('../common/helpers/filter-builder');
var _ = require('lodash')
var createdProjects=[]
var Entity = {
  "root": "/",
  "category": "projects",
  "path": "/tmp/TEST_PATH",
  "name": "UNIT_TEST_PROJECT",
  "description": "UNIT_TEST_PROJECT",
  "fields": {
      "priority": "High",
      "status": "Active",
      "colorspace_settings": "AlexaV3LogC",
      "3d_resolution": "ViperANA_2k 1920 1080 2.37",
      "studio": "Warner Bros.",
      "studio_contact": "Mark Brown",
      "supervisor": "Colin Strause",
      "producer": "Jeff Atherton"
  },
  "type": "projects"
}


describe('query search', function() {
	// before(function(done) {
	// 	var profile = {
	// 		'username': 'unit_test',
	// 		'password': 'password'
	// 	};
	// 	request(baseUrl)
	// 		.post('/api/Users/login')
	// 		.send(profile).expect(200)
	// 		.expect('Content-Type', /json/)
	// 		.end(function(err, res) {
	// 			if (err) return done(err)
	// 			token = res.body.id;
	// 			request(baseUrl)
	// 				.post('/api/EntityTypes/projects/entities')
	// 				.set('Authorization', token)
	// 				.send(Entity).expect(200)
	// 				.expect('Content-Type', /json/)
	// 				.end(function(err, res) {
	// 					if (err) return done(err)
	// 					createdProjects.push(res.body)
	// 					done();
	// 				})
	// 		});
	// })

//filter={'where':{'name':{'like':'humvee'},'or':[{'category':'assets'},{'category':'tasks'}],'project':'geostorm'}}

	it('should parse a single keyword with free text before it', function () {
	    var options = {keywords: [  'in', 'type', 'author', '-author',  'status', '-status',
	    							'assignee', '-assignee', 'category',
	    							'-category', '-type', 'label'], ranges: ['date']};
	    var str = 'type:"texture dfsdf",lookdev'.replace(/\s+/g, ' ');
		var allQoutedStrs = str.match(/"([^"]*)"|'([^']*)'/g) || []
		allQoutedStrs.map(function(item){
		  str = str.replace(new RegExp(item, 'g'), item.replace(/\s/g, '+'))
		});


	    var parsedSearchQuery = searchQuery.parse(str, options);
	    var filter = { where:{ project: 'geostorm'} };
	   	var _filter = filterBuilder(filter, parsedSearchQuery)

	    console.log(JSON.stringify(_filter))
	});
	// it('`foo` in:name', function(done){
	// 	var query = 'foo in:name'
	// 	request(baseUrl)
	// 		.get('/api/Entities/search?q=' + query)
	// 		.expect(200)
	// 		.expect('Content-Type', /json/)
	// 		.end(function(err, res) {
	// 			if (err) return done(err)
	// 			res.body.should.not.be.empty;
	// 			// res.body.should.equal(query);
	// 			done();
	// 		});
	// })
	// it('`foo` in:status', function(done){
	// 	var query = 'foo in:status,name type:groups -type:assets'
	// 	request(baseUrl)
	// 		.get('/api/Entities/search?q=' + query + '&filter[where][project]=geo')
	// 		.expect(200)
	// 		.expect('Content-Type', /json/)
	// 		.end(function(err, res) {
	// 			if (err) return done(err)
	// 			res.body.should.not.be.empty;
	// 			// res.body.should.equal(query);
	// 			console.log(res.body)
	// 			done();
	// 		});
	// })

	it('`foo` in:notes')
	it('`foo` in:milestones')


	// after(function(done) {
	// 	// Delete temp Entity
	// 	var projectID = createdProjects[0].id;
	// 	console.log('\tafter():','deleting Entity with id `%s`', projectID)
	// 	request(baseUrl)
	// 		.delete('/api/Entities/' + projectID)
	// 		.set('Authorization', token)
	// 		.expect(204)
	// 		.expect('Content-Type', /json/)
	// 		.end(function(err, res) {
	// 			if (err) return done(err)
	// 			done();
	// 		});
	// })
})
