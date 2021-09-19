const tableName = 'projects'

exports.up = async function (knex) {
  if (await knex.schema.hasTable(tableName)) return

  return knex.schema.createTable(tableName, function (table) {
    table.string('id').primary()
    table.string('id_organization').notNullable()
    table.string('name').notNullable()
    table.string('id_folder')
    table.string('info')
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('deleted_at')
  })
}

exports.down = function (knex) {

}
