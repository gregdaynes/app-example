const { Model } = require('../lib/database')

module.exports = class Asset extends Model {
  static get tableName () {
    return 'assets'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'idAsset',
        'idOrganization',
        'idProject',
        'provider',
        'mimeType',
        'fileUrl',
        'version',
        'fileSize',
      ],
      properties: {
        idAsset: {
          type: 'string',
          format: 'uuid',
        },
        idOrganization: {
          type: 'string',
          format: 'uuid',
        },
        idProject: {
          type: 'string',
          format: 'uuid',
        },
        mimeType: {
          type: 'string',
        },
        provider: {
          type: 'string',
        },
        file_url: {
          type: 'string',
        },
        fileSize: {
          type: 'number',
        },
        version: {
          type: 'number',
        },
        isDeletable: {
          type: 'boolean',
          default: false,
        },
      },
    }
  }

  static get relationMappings () {
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'organization',
        join: {
          from: 'assets.idOrganization',
          to: 'organizations.id',
        },
      },

      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'project',
        join: {
          from: 'assets.idProject',
          to: 'projects.id',
        },
      },

      files: {
        relation: Model.HasManyRelation,
        modelClass: 'asset',
        join: {
          from: 'assets.id',
          to: 'assets.idAsset',
        },
      },
    }
  }
}
