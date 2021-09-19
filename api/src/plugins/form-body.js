const fastifyFormBody = require('fastify-formbody')
const fastifyPlugin = require('fastify-plugin')

module.exports = fastifyPlugin(async (app) => {
  app.register(fastifyFormBody)
})
