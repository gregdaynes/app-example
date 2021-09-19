const S = require('fluent-json-schema')
const fastifyPlugin = require('fastify-plugin')
const { create, fetch, update, destroy } = require('@aftercoffee/app').services.note

const noteSchema = S.object()
  .prop('id', S.string().format(S.FORMATS.UUID))
  .prop('idOrganization', S.string().format(S.FORMATS.UUID))
  .prop('idAccount', S.string().format(S.FORMATS.UUID))
  .prop('idProject', S.string().format(S.FORMATS.UUID))
  .prop('idType', S.string().format(S.FORMATS.UUID))
  .prop('type', S.string())
  .prop('category', S.string())
  .prop('name', S.string())
  .prop('content', S.raw())
  .prop('createdAt', S.string().format(S.FORMATS.DATE_TIME))
  .prop('updatedAt', S.string().format(S.FORMATS.DATE_TIME))

module.exports = fastifyPlugin(async (app) => {
  app.post('/notes', {
    schema: {
      body: S.object(),
      response: {
        200: noteSchema,
      },
    },
    handler (request, reply) {
      return create({
        ...request.body,
        ...request.user,
      })
    },
  })

  app.get('/notes', {
    schema: {
      response: {
        200: S.array()
          .items(noteSchema),
      },
    },
    handler (request, reply) {
      return fetch({ ...request.user })
    },
  })

  app.get('/notes/:type/:idType', {
    schema: {
      response: {
        200: S.array()
          .items(noteSchema),
      },
    },
    handler (request, reply) {
      return fetch({
        type: request.params.type,
        idType: request.params.idType,
        ...request.user,
      })
    },
  })

  app.get('/notes/:idNote', {
    schema: {
      response: {
        200: noteSchema,
      },
    },
    async handler (request, reply) {
      const [note] = await fetch({
        id: request.params.idNote,
        deleted: true,
        ...request.user,
      })

      return { ...note }
    },
  })

  app.put('/notes/:idNote', {
    schema: {
      response: {
        200: noteSchema,
      },
    },
    async handler (request, reply) {
      const [note] = await update({
        id: request.params.idNote,
        ...request.body,
        ...request.user,
      })

      return { ...note }
    },
  })

  app.delete('/notes/:idNote', {
    schema: {
      response: {
        200: S.null(),
      },
    },
    async handler (request, reply) {
      const results = await destroy({
        id: request.params.idNote,
        ...request.user,
      })

      if (!results) reply.code(400)

      return {}
    },
  })
})

module.exports.noteSchema = noteSchema
