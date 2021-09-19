const tableName = 'assets'

exports.up = async function (knex) {
  if (await knex.schema.hasTable(tableName)) return

  return knex.schema.createTable(tableName, function (table) {
    table.uuid('id').primary()
    table.uuid('id_asset').notNullable()
    table.uuid('id_organization').notNullable()
    table.uuid('id_project').notNullable()

    table.string('mime_type').notNullable()
    table.string('provider').notNullable()
    table.string('file_url').notNullable()
    table.integer('version').notNullable()

    // in bytes limit to 2GB using integer
    // Bigint will allow much larger, but at the cost of 4 bytes per-record
    table.integer('file_size').notNullable()
    table.boolean('is_deletable').notNullable().defaultTo(0)

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  })
}

exports.down = function (knex) {

}
