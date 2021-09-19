const Organization = require('../models/organization')

module.exports = {
  create,
  fetch,
  update,
  destroy,
  list,
}

// TODO this needs to be secured somehow - currently not accessible through api
async function create (data) {
  const createdOrganization = await Organization.query().insert({
    abbreviation: data.abbreviation,
    name: data.name,
  })

  return Organization.query().findById(createdOrganization.id)
}

// TODO should only fetch orgs that are associated with the requesters token
async function fetch (data, options = {}) {
  const foundOrganization = await Organization.query()
    .where(data)
    .where(function (builder) {
      if (!options.deleted) builder.whereNotDeleted()
    })

  return foundOrganization
}

// ADMINISTATION ONLY
// THIS LISTS ALL ORGANIZATIONS
async function list (options = {}) {
  return await Organization.query()
    .where(function (builder) {
      if (!options.deleted) builder.whereNotDeleted()
    })
}

// TODO should only update orgs that are associated with the requesters token
async function update (id, data) {
  await Organization.query().where({ id }).patch(data)

  return await Organization.query().where({ id })
}

// TODO should only delete orgs that are associated with the requesters token
async function destroy (id) {
  return Organization.query().deleteById(id)
}
