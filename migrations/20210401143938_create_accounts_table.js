const tableName = 'accounts'

exports.up = async function (knex) {
  if (await knex.schema.hasTable(tableName)) return

  return knex.schema.createTable(tableName, (table) => {
    table.string('id').primary()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.string('salt').notNullable()
    table.string('display_name').notNullable() // can't be unique, people have the same name
    table.string('avatar')
    table.integer('num_logins').notNullable().defaultTo(0)
    table.integer('is_email_verified').notNullable().defaultTo(0)
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('deleted_at')
  })
}

exports.down = function (knex) {

}
