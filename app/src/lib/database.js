const Knex = require('knex')
const knexfile = require('../../../knexfile.js')
const path = require('path')
const { Model, knexSnakeCaseMappers, AjvValidator } = require('objection')
const SoftDelete = require('./soft-delete')
const { randomUUID } = require('crypto')

// Setup knex with configuration from the config file
const knex = Knex({
  ...knexfile,
  ...knexSnakeCaseMappers(),
})
module.exports = knex

// Objection Setup
Model.knex(knex)

const softDelete = SoftDelete({
  columnName: 'deleted_at',
  deletedValue: () => timestamp(),
  notDeletedValue: null,
})

module.exports.test = {
  async setup () {
    if (process.env.NODE_ENV !== 'test') return
    if (!knex.client.pool || knex.client.pool.destroyed) await knex.initialize()
    await knex.migrate.latest()
  },
  async del (table, id) {
    if (process.env.NODE_ENV !== 'test') return
    return knex(table)
      .where({ id })
      .del()
  },
  async teardown () {
    if (process.env.NODE_ENV !== 'test') return
    await knex.destroy()
  },
}

// Base model for objection models, this pre-sets the model path to be the models directory.
// This allows each model file to reference other models, without the need to use require, which
// prevents require loops.
class BaseModel extends softDelete(Model) {
  static get modelPaths () {
    // this assumes the module is located in lib/
    return [path.join(__dirname, '..', 'models')]
  }

  static createValidator () {
    return new AjvValidator({
      onCreateAjv: (ajv) => { },
      options: {
        allErrors: true,
        validateSchema: true,
        ownProperties: true,
        v5: true,
        coerceTypes: true,
      },
    })
  }

  async $beforeInsert (queryContext) {
    await super.$beforeInsert(queryContext)

    if (!this.id) this.id = await randomUUID()
    this.created_at = timestamp()
    this.updated_at = timestamp()
  }

  $beforeUpdate () {
    this.updated_at = timestamp()
  }
}

module.exports.Model = BaseModel

function timestamp () {
  // SQLite will take a string for time (has no concept of datetime)
  // MySQL will not and requires it to be a real datetime object or a mysql ready representation
  // of it in the correct timezone. Combine this with a correct `SET time_zone = timezone` during
  // the connection pool creation, gives us proper datetime.
  return new Date()
}
