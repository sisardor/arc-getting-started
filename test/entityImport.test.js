'use strict'
var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , should = require('should')
  , assert = chai.assert;
var constants = require('../common/helpers/constants');
var fs = require('fs');
var parse = require('csv-parse');
var path = require('path');


describe('yourModuleName', function() {
  var CSV_PATH = path.join(__dirname, './sample_entities.csv');
  var data = null

  before(function(done){
    var parser = parse({delimiter: '\t',columns: true, auto_parse:true}, function(err, rawData){
      data = rawData
      done()
    });

    fs.createReadStream(CSV_PATH).pipe(parser);
  });
  beforeEach(function(){
    // The beforeEach() callback gets run before each test in the suite.
  });

  it('parsedData', function(){
    processDate(data)
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

    var res = setFields(data, constants.CONST_FIELDS, fields)
    // console.log(res)
  });

  it('should throw error when args are wrong', function(){
    expect( () => setFields({}, 'key',  [{ name: 'test', options:{} }])  ).to.throw(TypeError, /Expected an array/);
    expect( () => setFields([], null,      [{ name: 'test', options:{} }])  ).to.throw(TypeError, /Expected key to be string/);
    expect( () => setFields([], 'key',  [{}])  ).to.throw(TypeError, /`options` properties/);
  })

  it('should not throw error when args are correct', function(){
    expect( () => setFields([], 'key', [{ name: 'test', options:{} }]) ).to.not.throw();
  })

  it('should parse correctly', function(){
    var commonFields = constants.CONSTANT_COMMON_FIELDS
    var key = constants.CONST_FIELDS
    var res = setFields(data, key, commonFields);
    // console.log(res)
    expect(res).to.have.deep.property('[0].fields.status')
    expect(res).to.have.deep.property('[0].fields.priority')
  })

  after(function() {

  });
});


function processDate(array) {
  // console.log('%j',array[0])
  array = setFields(array, constants.CONST_FIELDS, constants.CONSTANT_COMMON_FIELDS)

  return array
}


var slug = require('slug');
var _ = require('lodash')
var _pick = require('lodash/pick')
var _omit = require('lodash/omit')

function setFields(array, key, COMMON_FIELDS) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected an array');
  } else if (typeof key !== 'string') {
    throw new TypeError('Expected key to be string');
  } else if (!Array.isArray(COMMON_FIELDS)) {
    throw new TypeError('Expected COMMON_FIELDS to be array');
  } else if (!COMMON_FIELDS.every(function(t) { return t.hasOwnProperty('name') && t.hasOwnProperty('options')}) ) {
    throw new TypeError('Expected COMMON_FIELDS to be array of object with `name` & `options` properties');
  }

  const _fields = COMMON_FIELDS.map( item => item.name )
  let newArray = [];
  for (let i = array.length - 1; i >= 0; i--) {
    let commonFields = _pick(array[i], _fields)
    let customFields = parseCustomField(array[i].custom_fields)

    let fields = Object.assign({}, commonFields, customFields)
    let result = Object.assign({}, array[i], { [key] : fields })
    let entity = _omit(result, _fields, 'custom_fields')

    newArray.push(entity)
  }

  return newArray;
}

function parseCustomField(str) {
  if (!str || str === '' || typeof str !== 'string') {
    return {} //throw new TypeError('Cannot be null or empty');
  }

  let fields = str.split(/[,;]/)
  if(fields[fields.length-1] === '') {
    fields.pop()
  }

  return fields
    .map(function(_field) {
      let field = _field.split(':')
      if(field.length !== 2) {
        return {};
      }
      let newField = {}
      let prop = field[0];
      let value = field[1];

      if(!isNaN(value)) {
        value = parseInt(value);
      }
      newField[prop] = value;
      return newField;
    })
    .reduce(function(pValue, cValue) {
      return _.assign(pValue, cValue)
    });

}

