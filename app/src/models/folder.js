const { transformSlug } = require('../lib/helpers')
const { Model } = require('../lib/database')

module.exports = class Folder extends Model {
  static get tableName () {
    return 'folders'
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
        id: {
          type: 'string',
          format: 'uuid',
        },
        idOrganization: {
          type: 'string',
        },
        idFolderParent: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
      },
    }
  }

  static beforeInsert ({ items, context, inputItems }) {
    inputItems.forEach(function (item) {
      item.slug = transformSlug(item.name)
    })
  }

  static get relationMappings () {
    return {
      parentFolder: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'folder',
        join: {
          from: 'folders.idFolderParent',
          to: 'folders.id',
        },
      },

      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'organization',
        join: {
          from: 'folders.idOrganization',
          to: 'organizations.id',
        },
      },
    }
  }
}
