const { Model } = require('../lib/database')

module.exports = class Project extends Model {
  static get tableName () {
    return 'projects'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'idOrganization',
        'name',
      ],
      properties: {
        idFolder: {
          type: 'string',
        },
        idOrganization: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        info: {
          type: 'string',
        },
      },
    }
  }

  static get relationMappings () {
    return {
      folder: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'folder',
        join: {
          from: 'projects.idFolder',
          to: 'folders.id',
        },
      },

      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'organization',
        join: {
          from: 'projects.idOrganization',
          to: 'organizations.id',
        },
      },
    }
  }
}
