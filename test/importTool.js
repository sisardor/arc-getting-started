'use strict'
var _pick = require('lodash/pick')
var _omit = require('lodash/omit')
var _groupBy = require('lodash/groupBy')
var CONSTS = require('../common/helpers/constants')

module.exports = {
  parseFields: parseFields,
  parseCustomField: parseCustomField,
  groupBy: groupBy,
  importEntities: importEntities
}

function importEntities (array) {
  let result = parseFields(array, CONSTS.CONST_FIELDS,
    CONSTS.CONSTANT_COMMON_FIELDS)
  // setCreatedBy(array, constants.CONST_DEMO_USERNAME)
  return groupBy(result)
}

/**
 * Extracts common field, parses csv json and normalizes json to Entity model
 * @param {Array} array           array of raw data
 * @param {String} key            property key which need to be extracted
 * @param {Array} commonFields    Array of CommonFields, @see strongloop models
 * @return {Array} normalized     Entity models
 */
function parseFields (array, key, commonFields) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected an array')
  } else if (typeof key !== 'string') {
    throw new TypeError('Expected key to be string')
  } else if (!Array.isArray(commonFields)) {
    throw new TypeError('Expected commonFields to be array')
  } else if (!commonFields.every((t) => t.hasOwnProperty('name') &&
    t.hasOwnProperty('options'))) {
    throw new TypeError('Expected commonFields to be array of object with ' +
      '`name` & `options` properties')
  }

  const requiredCommonFields = commonFields.map((item) => item.name)
  let newArray = []
  for (let i = array.length - 1; i >= 0; i--) {
    const _commonFields = _pick(array[i], requiredCommonFields)
    const _customFields = (array[i][CONSTS.CUSTOM_FIELDS])
      ? parseCustomField(array[i][CONSTS.CUSTOM_FIELDS]) : {}

    let fields = Object.assign({}, _commonFields, _customFields)
    let result = Object.assign({}, array[i], { [key]: fields })
    let entity = _omit(result, requiredCommonFields, CONSTS.CUSTOM_FIELDS)

    newArray.push(entity)
  }

  return newArray
}

/**
 * parses string to json, string should of specific type or format
 * @param  {String} str string which will be parsed,
 *                      e.g. "param:value;param2:value2"
 * @return {Object}     returns parsed json, js Object
 *                      e.g. { param: 'value', param2: 'value2' }
 */
function parseCustomField (str) {
  if (!str || str === '' || typeof str !== 'string') {
    throw new TypeError('Cannot be null or empty')
  }

  let fields = str.split(/[,;]/)
  if (fields[fields.length - 1] === '') {
    fields.pop()
  }

  return fields
    .map((_field) => {
      let field = _field.split(':')
      if (field.length !== 2) {
        return {}
      }
      let newField = {}
      let prop = field[0]
      let value = field[1]

      if (!isNaN(value)) {
        value = parseInt(value, 10)
      }
      newField[prop] = value
      return newField
    })
    .reduce((pValue, cValue) => Object.assign(pValue, cValue))
}

function groupBy (array) {
  return _groupBy(array, (item) => item.parent)
}
