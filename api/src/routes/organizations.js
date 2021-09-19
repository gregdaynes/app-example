const S = require('fluent-json-schema')
const fastifyPlugin = require('fastify-plugin')
const { fetch: accountFetch } = require('@aftercoffee/app').services.account
const { fetch, update, destroy } = require('@aftercoffee/app').services.organization

const paramSchema = S.object('idOrganization', S.string().required())

const organizationSchema = S.object()
  .prop('id', S.string(S.FORMATS.UUID))
  .prop('abbreviation', S.string())
  .prop('name', S.string())
  .prop('createdAt', S.string(S.FORMATS.DATE_TIME))
  .prop('updatedAt', S.string(S.FORMATS.DATE_TIME))

module.exports = fastifyPlugin(async (app) => {
  // POST IS PURPOSEFULLY LEFT OUT
  // We do not want the ability to create organizations from the api

  app.get('/organizations', {
    schema: {
      response: {
        200: S.array()
          .items(organizationSchema),
      },
    },
    async handler (request, reply) {
      const { organizations } = await accountFetch({
        id: request.user.idAccount,
      }, { withOrganizations: true })

      return organizations
    },
  })

  app.get('/organizations/:idOrganization', {
    schema: {
      params: paramSchema,
      response: {
        200: organizationSchema,
      },
    },
    async handler (request, reply) {
      const [organization] = await fetch({
        'organizations.id': request.params.idOrganization,
      }, {
        deleted: true,
      })

      return organization
    },
  })

  app.put('/organizations/:idOrganization', {
    schema: {
      params: paramSchema,
      response: {
        200: organizationSchema,
      },
    },
    async handler (request, reply) {
      const [organization] = await update(request.params.idOrganization, request.body)

      return organization
    },
  })

  app.delete('/organizations/:idOrganization', {
    schema: {
      params: paramSchema,
      response: {
        200: S.null(),
      },
    },
    handler (request, reply) {
      return destroy(request.params.idOrganization)
    },
  })
})
