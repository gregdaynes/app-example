const tableName = 'accounts_organizations'

exports.up = async function (knex) {
  if (await knex.schema.hasTable(tableName)) return

  return knex.schema.createTable(tableName, function (table) {
    table.increments('id').primary()
    table.string('id_account').notNullable()
    table.string('id_organization').notNullable()
    table.integer('is_owner').notNullable().defaultTo(0)
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('deleted_at')
  })
}

exports.down = function (knex) {

}
