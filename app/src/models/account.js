const { Model } = require('../lib/database')

module.exports = class Account extends Model {
  static get tableName () {
    return 'accounts'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'email',
        'password',
        'salt',
        'displayName',
      ],
      properties: {
        id: {
          type: 'string',
        },
        password: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
        },
        salt: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
        },
        displayName: {
          type: 'string',
        },
        avatar: {
          type: 'string',
        },
        numLogins: {
          type: 'integer',
          default: 0,
        },
        isEmailVerified: {
          type: 'integer',
          default: 0,
        },
      },
    }
  }

  static get relationMappings () {
    return {
      organizations: {
        relation: Model.ManyToManyRelation,
        modelClass: 'organization',
        join: {
          from: 'accounts.id',
          through: {
            from: 'accounts_organizations.idAccount',
            to: 'accounts_organizations.idOrganization',
          },
          to: 'organizations.id',
        },
      },

      notes: {
        relation: Model.HasManyRelation,
        modelClass: 'note',
        join: {
          from: 'accounts.id',
          to: 'notes.idAccount',
        },
      },
    }
  }
}
