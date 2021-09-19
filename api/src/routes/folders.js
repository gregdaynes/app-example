const S = require('fluent-json-schema')
const fastifyPlugin = require('fastify-plugin')
const { create, fetch, update, destroy } = require('@aftercoffee/app').services.folder

const paramSchema = S.object().prop('idFolder', S.string().required())

const folderSchema = S.object()
  .prop('id', S.string(S.FORMATS.UUID))
  .prop('idOrganization', S.string(S.FORMATS.UUID))
  .prop('idFolderParent', S.anyOf([S.null(), S.string(S.FORMATS.UUID)]))
  .prop('name', S.string())
  .prop('slug', S.string())
  .prop('createdAt', S.string(S.FORMATS.DATE_TIME))
  .prop('updatedAt', S.string(S.FORMATS.DATE_TIME))

module.exports = fastifyPlugin(async (app) => {
  app.post('/folders', {
    schema: {
      body: S.object()
        .prop('name', S.string().required())
        .prop('idFolderParent', S.string()),
      response: {
        200: folderSchema,
      },
    },
    async handler (request, reply) {
      try {
        return await create({
          ...request.body,
          ...request.user,
        })
      } catch (err) {
        app.log.error(err)

        reply.status(400)
        return {
          error: 'Bad Request',
        }
      }
    },
  })

  app.get('/folders', {
    schema: {
      response: {
        200: S.array()
          .items(folderSchema),
      },
    },
    handler (request, reply) {
      return fetch({
        idOrganization: request.user.idOrganization,
      })
    },
  })

  app.get('/folders/:idFolder', {
    schema: {
      params: paramSchema,
      response: {
        200: folderSchema,
      },
    },
    async handler (request, reply) {
      const [folder] = await fetch({
        id: request.params.idFolder,
        ...request.user,
        deleted: true,
      })

      return folder
    },
  })

  app.put('/folders/:idFolder', {
    schema: {
      params: paramSchema,
      response: {
        200: folderSchema,
      },
    },
    async handler (request, reply) {
      const [folder] = await update({
        id: request.params.idFolder,
        ...request.body,
        ...request.user,
      })

      return { ...folder }
    },
  })

  app.delete('/folders/:idFolder', {
    schema: {
      params: paramSchema,
      response: {
        200: S.null(),
      },
    },
    async handler (request, reply) {
      const results = await destroy({
        id: request.params.idFolder,
        ...request.body,
        ...request.user,
      })

      if (!results) reply.code(400)

      return {}
    },
  })
})
