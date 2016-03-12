'use strict'
var _assign = require('lodash/object/assign')
const CATEGORY = 'category'
const CATEGORY_CAP = 'Category'
const MILESTONE = 'milestone'
const MILESTONE_CAP = 'Milestone'
const AUTHOR = 'author'
const ASSIGNEE = 'assignees'
const ASSIGNEE_CAP = 'Assignees'
const TYPE = 'type'
const TYPE_CAP = 'Type'
const STATUS = 'status'
const STATUS_CAP = 'Status'
const PRIORITY = 'priority'
const PRIORITY_CAP = 'Priority'

module.exports = function functionName (filter, parsedSearchQuery) {
  for (var key in parsedSearchQuery) {
    if (typeof parsedSearchQuery[key] === 'string') {
      parsedSearchQuery[key] = parsedSearchQuery[key].replace('%20', ' ')
    }
  }

  var TEXT = parsedSearchQuery.text

  if (parsedSearchQuery['in']) {
    var title = parsedSearchQuery['in']
    if (Array.isArray(title) && title.length > 0) {
      console.log('title: Array')
    } else if (typeof title === 'string') {
      let query = {}
      query[title] = {like: TEXT}
      filter.where = _assign({}, filter.where, query)
    }
  }
  if (parsedSearchQuery[CATEGORY] ||
    parsedSearchQuery['-' + CATEGORY]) {
    let query = {
      category: pargeToFilter(CATEGORY, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[CATEGORY_CAP] ||
    parsedSearchQuery['-' + CATEGORY_CAP]) {
    let query = {
      category: pargeToFilter(CATEGORY_CAP, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[AUTHOR] ||
    parsedSearchQuery['-' + AUTHOR]) {
    let query = {
      author: pargeToFilter(AUTHOR, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[ASSIGNEE] ||
    parsedSearchQuery['-' + ASSIGNEE]) {
    let query = {
      assignees: pargeToFilter(ASSIGNEE, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[ASSIGNEE_CAP] ||
    parsedSearchQuery['-' + ASSIGNEE_CAP]) {
    let query = {
      assignees: pargeToFilter(ASSIGNEE_CAP, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[STATUS] ||
    parsedSearchQuery['-' + STATUS]) {
    let query = {
      'fields.status': pargeToFilter(STATUS, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[STATUS_CAP] ||
    parsedSearchQuery['-' + STATUS_CAP]) {
    let query = {
      'fields.status': pargeToFilter(STATUS_CAP, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[TYPE] ||
    parsedSearchQuery['-' + TYPE]) {
    let query = {
      type: pargeToFilter(TYPE, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[TYPE_CAP] ||
    parsedSearchQuery['-' + TYPE_CAP]) {
    let query = {
      type: pargeToFilter(TYPE_CAP, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }

  if (parsedSearchQuery[PRIORITY] ||
    parsedSearchQuery['-' + PRIORITY]) {
    let query = {
      'fields.priority': pargeToFilter(PRIORITY, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[PRIORITY_CAP] ||
    parsedSearchQuery['-' + PRIORITY_CAP]) {
    let query = {
      'fields.priority': pargeToFilter(PRIORITY_CAP, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }

  if (parsedSearchQuery[MILESTONE] ||
    parsedSearchQuery['-' + MILESTONE]) {
    let query = {
      milestone: pargeToFilter(MILESTONE, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  if (parsedSearchQuery[MILESTONE_CAP] ||
    parsedSearchQuery['-' + MILESTONE_CAP]) {
    let query = {
      milestone: pargeToFilter(MILESTONE_CAP, parsedSearchQuery)
    }
    filter.where = _assign({}, filter.where, query)
  }
  return filter
}

function pargeToFilter (key, parsedSearchQuery) {
  var property = parsedSearchQuery[key]
  var minusProperty = parsedSearchQuery['-' + key]
  var criteria = {}

  if (parsedSearchQuery[key] && Array.isArray(property)) {
    criteria.like = property.map((item) => item).join('|')
  } else if (parsedSearchQuery[key] && typeof property === 'string') {
    criteria.like = property
  }

  if (parsedSearchQuery['-' + key] && Array.isArray(minusProperty)) {
    criteria.nlike = minusProperty.map((item) => item).join('|')
  } else if (parsedSearchQuery['-' + key] &&
    typeof minusProperty === 'string') {
    criteria.nlike = minusProperty
  }

  return criteria
}
