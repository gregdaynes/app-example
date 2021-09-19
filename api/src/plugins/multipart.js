const fastifyPlugin = require('fastify-plugin')
const fastifyMultipart = require('fastify-multipart')

module.exports = fastifyPlugin(async (app) => {
  app.register(fastifyMultipart, {
    limits: {
      files: 1, // Max number of file fields
    },
    attachFieldsToBody: true,
  })
})
