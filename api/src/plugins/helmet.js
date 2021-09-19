const fastifyPlugin = require('fastify-plugin')
const helmet = require('fastify-helmet')

module.exports = fastifyPlugin(async (app) => {
  app.register(helmet, {})
})
