const { Model } = require('../lib/database')

module.exports = class Note extends Model {
  static get tableName () {
    return 'notes'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'idOrganization',
        'idAccount',
        'idProject',
        'type',
        'category',
        'content',
      ],
      properties: {
        idOrganization: {
          type: 'string',
          format: 'uuid',
        },
        idAccount: {
          type: 'string',
          format: 'uuid',
        },
        idProject: {
          type: 'string',
          format: 'uuid',
        },
        idType: {
          type: 'string',
          format: 'uuid',
        },
        type: { type: 'string' },
        category: { type: 'string' },
        name: { type: 'string' },
        content: { type: 'object' },
      },
    }
  }

  static get relationMappings () {
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'organization',
        join: {
          from: 'notes.idOrganization',
          to: 'organizations.id',
        },
      },

      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'account',
        join: {
          from: 'notes.idAccount',
          to: 'accounts.id',
        },
      },

      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'project',
        join: {
          from: 'notes.idProject',
          to: 'projects.id',
        },
      },
    }
  }
}
