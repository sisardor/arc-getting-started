module.exports = Object.freeze({
	CONST_STRING: 'string',
	CONST_SELECT: 'Select',
	CONST_BOOLEAN: 'Boolean',
	CONST_NUMBER: 'number',
	CONST_DATE: 'Date',
	CUSTOM_FIELDS: 'custom_fields',
	CONST_JSON: 'JSON',
  SKIP: 2,
  LIMIT: 2,
  ENTITY_TYPE_ASSETS: 'assets',
  ENTITY_TYPE_GROUPS: 'groups',
  ENTITY_TYPE_TASKS: 'tasks',
  ENTITY_TYPE_PROJECTS: 'projects',
  CONSTANT_CATEGORY: 'category',

  UPDATE_MASTER_SYMLINK: 'UPDATE_MASTER_SYMLINK',
  MASTER: 'MASTER',
  CONST_DEMO_USERNAME: 'chris',
  CONST_ROOT: 'root',
  CONST_FIELDS: 'fields',

  PROGRESS: '$progress',
  DEPENDENCY_COUNT: '$dependencyCount',
  LATEST_MILESTONE: '$latestMilestone',
  MILESTONES: '$milestones',
  ADD_MILESTONES: 'ADD_MILESTONES',
	ADD_ASSIGNEES:'ADD_ASSIGNEES',
	UPDATE_MILESTONES: 'UPDATE_MILESTONES',
	UPDATE_ASSIGNEES: 'UPDATE_ASSIGNEES',

	PROVISION_PROGRESS: 'PROVISION_PROGRESS',
	PROVISION_DEPENDENCY_COUNT: 'PROVISION_DEPENDENCY_COUNT',
	PROVISION_LATEST_MILESTONE: 'PROVISION_LATEST_MILESTONE',

	CONSTANT_COMMON_FIELDS: [
		{
			name: 'priority',
			description: 'Entity priority',
			label: 'Priority',
			type: 'Select',
			default: 'none',
			options: [
				/*'none'
				'low',
				'medium',
				'high',
				'urgent',
				'crucial'*/
				{
					label: 'None',
					name: 'none',
					color: '#948F8F'
				},
				{
					label: 'Low',
					name: 'low',
					color: '#99c'
				},
				{
					label: 'Medium',
					name: 'medium',
					color: '#ffe900'
				},
				{
					label: 'High',
					name: 'high',
					color: '#ff3333'
				},
				{
					label: 'Urgent',
					name: 'urgent',
					color: '#f59'
				},
				{
					label: 'Critical',
					name: 'critical',
					color: '#f8d'
				}
			],
			required: true,
			readonly: true,
			broadcastChanges: true
		},
		{
			name: 'status',
			description: 'Production status',
			label: 'Status',
			type: 'Select',
			default: 'bidding',
			options: [
				{
					label: 'Bidding',
					name: 'bidding',
					refers_to: 'pending',
					color: '#948F8F'
				},
				{
					label: 'Idle',
					name: 'idle',
					refers_to: 'pending',
					color: '#948F8F'
				},
				{
					label: 'Review',
					name: 'review',
					refers_to: 'hold',
					color: '#ffe900'
				},
				{
					label: 'Revised',
					name: 'revised',
					refers_to: 'wip',
					color: '#99c'
				},
				{
					label: 'Hold',
					name: 'hold',
					refers_to: 'hold',
					color: '#ff3333'
				},
				{
					label: 'Active',
					name: 'active',
					refers_to: 'wip',
					color: '#33FF00'
				},

				{
					label: 'Approved',
					name: 'approved',
					refers_to: 'complete',
					color: '#CEE808'
				},
				{
					label: 'Completed',
					name: 'completed',
					refers_to: 'complete',
					color: '#9adaff'
				},
			],
			required: true,
			readonly: true,
			broadcastChanges: true
		}
	]
});
