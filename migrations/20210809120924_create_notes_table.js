const tableName = 'notes'

exports.up = async function (knex) {
  if (await knex.schema.hasTable(tableName)) return

  return knex.schema.createTable(tableName, function (table) {
    table.uuid('id').primary()
    table.uuid('id_organization').notNullable()
    table.uuid('id_account').notNullable()
    table.uuid('id_project').notNullable()
    table.uuid('id_type')
    table.string('type').notNullable()
    table.string('category')
    table.string('name')
    // mysql blob shouuld be good enought, 64KB storage ~= 65k characters
    table.json('content').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  })
}

exports.down = function (knex) {

}
