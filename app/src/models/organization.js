const { Model } = require('../lib/database')
const { transformAbbreviation } = require('../lib/helpers')

module.exports = class Organization extends Model {
  static get tableName () {
    return 'organizations'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'abbreviation',
        'name',
      ],
      properties: {
        abbreviation: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        isOwner: {
          type: 'integer',
          defualt: 0,
        },
      },
    }
  }

  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)

    this.abbreviation = transformAbbreviation(this.abbreviation)
  }

  async $beforeUpdate (queryContext) {
    await super.$beforeUpdate(queryContext)

    if (this.abbreviation) {
      this.abbreviation = transformAbbreviation(this.abbreviation)
    }
  }

  static get relationMappings () {
    return {
      accounts: {
        relation: Model.ManyToManyRelation,
        modelClass: 'account',
        join: {
          from: 'organizations.id',
          through: {
            from: 'accounts_organizations.idOrganization',
            to: 'accounts_organizations.idAccount',
          },
          to: 'accounts.id',
        },
      },
    }
  }
}
