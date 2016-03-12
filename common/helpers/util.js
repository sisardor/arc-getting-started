var slug = require('slug');
var _ = require('lodash');

module.exports =  {
  pad: pad,
  slugify: slugify,
  error401: error401,
  extractCommonFields: extractCommonFields,
  setFields:setFields,
  guid:guid
};


function guid(num) {
    if(num === undefined) num = 1
    function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(num);
    }
    return s4() + s4();
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function slugify(title) {
  if (typeof title !== 'string') {
      throw new Error('Expected `title` to be string.');
    }
  return slug(title, {lower: true});
}

function error401() {
  var error = new Error('Authorization Required');
  error.statusCode = error.status = 401;
  error.code = 'AUTHORIZATION_REQUIRED';
  return error;
}


/**
 * extracts common field from raw object and delete from it.
 * @param  {Object} item              raw object from csv import, one row
 * @param  {Array} predfCommonFields  array of commonFields from CommonFields
 *                                    model
 * @return {Object}                   object of common fields which will be
 *                                    add to Entity model as 'entity.field',
 *                                    e.g. {priority: "none", status: "idle"}
 */
function extractCommonFields(item, predfCommonFields) {
  if (typeof item !== 'object' && item.hasOwnProperty('name')) {
    throw new Error('Expected `item` to be an array.');
  }

  var result = {};
  predfCommonFields.forEach( row => {
    result[row.name] = item[row.name];
    delete item[row.name];
  });

  return result;
}


/**
 * Extracts common field, parses csv json and normalizes json to Entity model
 * @param {Array} array           array of raw data
 * @param {String} key            property key which need to be extracted
 * @param {Array} COMMON_FIELDS   Array of CommonFields, @see strongloop models
 * @return {Array} normalized     Entity models
 */
function setFields(array, key, COMMON_FIELDS) {
  if (!Array.isArray(array)) {
    throw new Error('Expected `array` to be an array.');
  }
  if (typeof key !== 'string') {
    throw new Error('Expected `key` to be string.');
  }
  var isCorrectObject = COMMON_FIELDS.every((t) =>
    t.hasOwnProperty('name') && t.hasOwnProperty('options'))
  if (!isCorrectObject) {
    throw new Error('Expected COMMON_FIELDS to be array of ' +
      'object with `name` & `options` properties.');
  }

  function mapField(_field) {
    var field = _field.split(':')
    if(field.length !== 2) {
      return {};
    }
    var newField = {}
    var prop = field[0];
    var value = field[1];

    if(!isNaN(value)) {
      value = parseInt(value);
    }
    newField[prop] = value;
    return newField;
  }

  function reduceField(pValue, cValue) {
    return _.assign(pValue, cValue)
  }


  for (var i = array.length - 1; i >= 0; i--) {
    array[i][key] = extractCommonFields(array[i], COMMON_FIELDS);

    var fields = array[i].custom_fields.split(/[,;]/)

    if(fields[fields.length-1] === '') {
      fields.pop()
    }

    var reduced = fields
                    .map(mapField)
                    .reduce(reduceField);

    array[i][key] = _.assign(array[i][key], reduced);
    delete array[i].custom_fields;
  }
  return array;
}
