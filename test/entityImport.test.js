'use strict'
var chai = require('chai')
var expect = chai.expect
var sinon = require('sinon')
var should = require('should')
var assert = chai.assert;
var constants = require('../common/helpers/constants');
var fs = require('fs');
var parse = require('csv-parse');
var path = require('path');
var importTool = require('./importTool')
const projectEntity = {
  name: 'geostorm',
  parent: 'root',
  project: 'geostorm',
  category: 'projects',
  type: 'projects',
  description: 'Feature moive',
  fileImportPath: '',
  fields: {
    priority: 'none',
    status: 'idle',
    project_resolution: '2k_Super35_24p',
    colorspace_settings: 'AlexaV3LogC',
    '3d_resolution': 'ViperANA_2k 1920 1080 2.37',
    studio: 'Warner Bros.',
    studio_contact: 'Mark Brown',
    supervisor: 'Colin Strause',
    producer: 'Jeff Atherton'
   }
}


describe('importTool (importTool.js)', function() {
  var data = null
  before(function(done){
    var input = 'name	parent	project	category	type	priority	status	description	fileImportPath	custom_fields\n'+
      'geostorm	root	geostorm	projects	projects	none	idle	Feature moive		project_resolution:2k_Super35_24p;colorspace_settings:AlexaV3LogC;3d_resolution:ViperANA_2k 1920 1080 2.37;studio:Warner Bros.;studio_contact:Mark Brown;supervisor:Colin Strause;producer:Jeff Atherton;'
    parse(input,{delimiter: '\t',columns: true, auto_parse:true}, function(err, rawData){
      data = rawData
      done()
    });
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
  });

  it('should parse csv to json', function(){
    expect(data).to.be.instanceof(Array);
    expect(data).to.have.deep.property('[0].name');
    expect(data[0]).to.have.property('project');
    // expect(data[0]).to.have.keys('project')
    data[0].should.have.property('project').with.length(8)
    data[0].should.have.properties('name')

    var fields = constants.CONSTANT_COMMON_FIELDS

    fields[0].should.have.properties('name', 'options')
    // delete fields[0].options
    fields[0].should.have.properties('name', 'options')

    var res = importTool.parseFields(data, constants.CONST_FIELDS, fields)
    // console.log(res)
  })
  it('should throw error when args are wrong', function(){
    expect( () => importTool.parseFields({}, 'key',  [{ name: 'test', options:{} }])  ).to.throw(TypeError, /Expected an array/);
    expect( () => importTool.parseFields([], null,      [{ name: 'test', options:{} }])  ).to.throw(TypeError, /Expected key to be string/);
    expect( () => importTool.parseFields([], 'key',  [{}])  ).to.throw(TypeError, /`options` properties/);
  })
  it('should not throw error when args are correct', function(){
    expect( () => importTool.parseFields([], 'key', [{ name: 'test', options:{} }]) ).to.not.throw();
  })
  it('should parse correctly', function(){
    var commonFields = constants.CONSTANT_COMMON_FIELDS
    var key = constants.CONST_FIELDS
    var res = importTool.parseFields(data, key, commonFields);
    // console.log(res)
    expect(res).to.have.deep.property('[0].fields.status', 'idle')
    expect(res).to.have.deep.property('[0].fields.priority')
    expect(res).to.have.deep.property('[0].fields.project_resolution', '2k_Super35_24p')
    expect(res).to.have.deep.property('[0].fields.colorspace_settings')
    expect(res).to.have.deep.property('[0].fields.studio')
  })
  it('should omit "custom_fields, status, priority" from parsed data', function() {
    var commonFields = constants.CONSTANT_COMMON_FIELDS
    var key = constants.CONST_FIELDS
    var res = importTool.parseFields(data, key, commonFields);
    expect(res).to.have.not.deep.property('[0].custom_fields')
    expect(res).to.have.not.deep.property('[0].status')
    expect(res).to.have.not.deep.property('[0].priority')
  })
  it('should contain all property keys and equal values', function() {
    var commonFields = constants.CONSTANT_COMMON_FIELDS
    var key = constants.CONST_FIELDS
    var res = importTool.parseFields(data, key, commonFields);
    res[0].should.eql(projectEntity)
  })
  it('should parse the string to json, importTool.parseCustomField(str)', function() {
    var res = importTool.parseCustomField('project_resolution:2k_Super35_24p;colorspace_settings:AlexaV3LogC;;');
    res.should.eql({ project_resolution: '2k_Super35_24p',colorspace_settings: 'AlexaV3LogC' })
  })
  it('should fail to parse string to json')
  it('should throw error when input is incorrect')
  it('should validate')

  after(function() {
  });
});


function processDate(array) {
  // console.log('%j',array[0])
  array = importTool.parseFields(array, constants.CONST_FIELDS, constants.CONSTANT_COMMON_FIELDS)

  return array
}
