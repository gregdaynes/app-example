const faker = require('faker')
const database = require('../app/src/lib/database')
const models = require('../app/src/models')
const { hash } = require('../app/src/lib/hash')

exports.seed = async function seed (config) {
  config.context.utils = {
    database,
    faker,
    models,
    hash,

    // Check object has keys otherwise throws errors
    // useful for checking if envars set
    fetch (data = {}, keys = []) {
      keys = keys || Object.keys(data)

      const factory = {}
      for (const key of keys) {
        const value = data[`${key}`]

        if (!value && value !== null) {
          throw new Error(`Environment variable "${key}" is required, set in .env.local`)
        }

        factory[`${key}`] = value
      }

      return factory
    },

    async clearTables (tableNames = []) {
      if (!Array.isArray(tableNames)) tableNames = [tableNames]

      return await Promise.all(tableNames.map((tableName) => database(tableName).del()))
    },
  }

  config.context.data = {}
}
