var createDependency = {
  description: ('Create a new Entity instance, setting it as a dependency ' +
    'of this Entity'),
  accepts: [
    {
      arg: 'id',
      type: 'any',
      description: 'Entity id',
      required: true,
      http: { source: 'path' }
    }, {
      arg: 'data',
      type: 'object',
      description: 'new Entity instance data',
      required: true,
      http: { source: 'body' }
    }, {
      arg: 'isChild',
      type: 'boolean',
      description: 'Inherit the path and root of this Entity',
      http: { source: 'query' }
    }],
  returns: {
    arg: 'data',
    type: 'Entity',
    root: true
  },
  http: {
    verb: 'post',
    path: '/:id/dependency'
  }
}

var querySearch = {
  description: 'custom query search',
  accepts: [
    {
      arg: 'ctx',
      type: 'object',
      description: 'context',
      required: false,
      http: { source: 'req' }
    }, {
      arg: 'q',
      type: 'any',
      description: 'Query filter.',
      required: true,
      http: { source: 'query' }
    }
  ],
  returns: {
    arg: 'data',
    type: 'Entity',
    root: true
  },
  http: {
    verb: 'get',
    path: '/search'
  }
}

var getProgress = {
  description: 'Get status from child entities or dependencies',
  accepts: [{
    arg: 'id',
    type: 'any',
    description: 'Entity id',
    required: true,
    http: {
      source: 'path'
    }
  }, {
    arg: 'type',
    type: 'string',
    description: 'progress type, or commonField type (e.g. status, priority)',
    required: true,
    http: {
      source: 'query'
    }
  }],
  returns: {
    arg: 'data',
    type: 'Entity',
    root: true
  },
  http: {
    verb: 'get',
    path: '/:id/progress'
  }
}

var getDependencies = {
  description: 'Get all collections for given Entity id',
  accepts: [{
    arg: 'id',
    type: 'any',
    description: 'Entity id',
    required: true,
    http: { source: 'path' }
  }, {
    arg: 'filter',
    type: 'object',
    description: 'Query filter',
    required: false,
    http: {
      source: 'query'
    }
  }, {
    arg: 'modelName',
    type: 'string',
    description: 'Specify model name',
    required: false,
    http: {
      source: 'body'
    }
  }],
  returns: {
    arg: 'data',
    type: 'Entity',
    root: true
  },
  http: {
    verb: 'get',
    path: '/:id/dependencies'
  }
}

var getMilestones = {
  description: 'Get all milestones for this entity.',
  accepts: [
    {
      arg: 'id',
      type: 'any',
      description: 'Entity id',
      required: true,
      http: { source: 'path' }
    },
    {
      arg: 'filter',
      type: 'object',
      description: 'Query filter.',
      required: false,
      http: { source: 'query' }
    },
    {
      arg: 'modelName',
      type: 'string',
      description: 'Specify model name',
      required: false,
      http: { source: 'body' }
    }
  ],
  returns: {
    arg: 'data',
    type: 'Entity',
    root: true
  },
  http: {
    verb: 'get',
    path: '/:id/milestones'
  }
}

var publish = {
  description: 'Apply all \'onPublish\' Actions to a given Entity id',
  accepts: [
    {
      arg: 'id',
      type: 'any',
      description: 'Entity id',
      http: {
        source: 'path'
      }
    },
    {
      arg: 'isMajorVersion',
      type: 'boolean',
      default: false,
      description: 'Is this major version',
      http: {
        source: 'query'
      }
    }
  ],
  returns: {
    arg: 'data',
    type: 'Entity',
    root: true
  },
  http: {
    verb: 'put',
    path: '/:id/publish'
  }
}

module.exports = {
  querySearch: querySearch,
  getProgress: getProgress,
  createDependency: createDependency,
  getDependencies: getDependencies,
  getMilestones: getMilestones,
  publish: publish
}
