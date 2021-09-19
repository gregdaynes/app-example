---
to: migrations/<%= h.now() %>_create_<%= h.changeCase.snakeCase(h.inflection.pluralize(name)) %>_table.js
---
<%
  plural = h.changeCase.camelCase(h.inflection.pluralize(name))
  Plural = h.changeCase.pascalCase(h.inflection.pluralize(Name))
  singular = h.changeCase.camelCase(h.inflection.singularize(name))
  Singular = h.changeCase.pascalCase(h.inflection.singularize(Name))
%>const tableName = '<%= h.changeCase.snakeCase(h.inflection.pluralize(name)) %>'

exports.up = async function (knex) {
  if (await knex.schema.hasTable(tableName)) return

  return knex.schema.createTable(tableName, function (table) {
    table.uuid('id').primary()
    table.uuid('id_organization').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  })
}

exports.down = function (knex) {

}
