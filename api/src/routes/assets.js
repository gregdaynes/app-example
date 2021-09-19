const { readFile } = require('fs/promises')

const { receive, fetch } = require('@aftercoffee/app').services.asset
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async (app) => {
  app.post('/assets', {
    async handler (request) {
      // multipart form wraps up the values received on the body object
      // with another object, with an accessor `.value` to retrieve
      const idAsset = request.body.idAsset?.value
      const idProject = request.body.idProject.value
      const data = request.body.file

      return await receive({
        idAsset,
        idProject,
        data,
        ...request.user,
      })
    },
  })

  app.get('/assets/:idAsset', {
    async handler (request, reply) {
      const { filePath, mimeType } = await fetch({
        ...request.params,
        ...request.user,
      })

      const fileBuffer = await readFile(filePath)
      reply.header('Content-Type', mimeType)
      reply.send(fileBuffer)
    },
  })
})
