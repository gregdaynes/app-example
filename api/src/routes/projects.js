const S = require('fluent-json-schema')
const fastifyPlugin = require('fastify-plugin')
const services = require('@aftercoffee/app').services
const { noteSchema } = require('./notes')
const { create, fetch, update, destroy } = services.project
const { fetch: noteFetch } = services.note

const lessonSchema = S.object()
  .prop('id', S.string(S.FORMATS.UUID))
  .prop('idScript', S.string(S.FORMATS.UUID))
  .prop('idProject', S.string(S.FORMATS.UUID))
  .prop('name', S.string())
  .prop('info', S.string())

const projectSchema = S.object()
  .prop('id', S.string(S.FORMATS.UUID))
  .prop('idFolder', S.anyOf([S.null(), S.string(S.FORMATS.UUID)]))
  .prop('name', S.string())
  .prop('info', S.string())
  .prop('createdAt', S.string(S.FORMATS.DATE_TIME))
  .prop('updatedAt', S.string(S.FORMATS.DATE_TIME))

module.exports = fastifyPlugin(async (app) => {
  app.post('/projects', {
    schema: {
      body: S.object()
        .prop('idFolder', S.anyOf([S.null(), S.string()]))
        .prop('info', S.string().required())
        .prop('name', S.string().required()),
      response: {
        200: projectSchema,
      },
    },
    handler (request, reply) {
      return create({
        ...request.body,
        // provides idOrganization
        ...request.user,
      })
    },
  })

  app.get('/projects', {
    schema: {
      response: {
        200: S.array()
          .items(projectSchema),
      },
    },
    handler (request, reply) {
      return fetch({ ...request.user })
    },
  })

  app.get('/projects/:idProject', {
    schema: {
      response: {
        200: projectSchema,
      },
    },
    async handler (request, reply) {
      const [project] = await fetch({
        id: request.params.idProject,
        deleted: true,
        ...request.user,
      })

      return { ...project }
    },
  })

  app.get('/projects/:idProject/lessons', {
    schema: {
      response: {
        200: S.object()
          .prop('lessons', S.array().items(lessonSchema)),
      },
    },
    async handler (request, reply) {
      const lessons = await services.lesson.fetch({
        idProject: request.params.idProject,
        ...request.user,
      })

      return { lessons }
    },
  })

  app.get('/projects/:idProject/notes', {
    schema: {
      response: {
        200: S.array()
          .items(
            noteSchema,
          ),
      },
    },
    async handler (request, reply) {
      return await noteFetch({
        idProject: request.params.idProject,
        ...request.user,
      })
    },
  })

  app.put('/projects/:idProject', {
    schema: {
      response: {
        200: projectSchema,
      },
    },
    async handler (request, reply) {
      const [project] = await update({
        id: request.params.idProject,
        ...request.body,
        ...request.user,
      })

      return { ...project }
    },
  })

  app.delete('/projects/:idProject', {
    schema: {
      response: {
        200: S.null(),
      },
    },
    async handler (request, reply) {
      const results = await destroy({
        id: request.params.idProject,
        ...request.user,
      })

      if (!results) reply.code(400)

      return {}
    },
  })
})
