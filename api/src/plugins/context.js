const fastifyPlugin = require('fastify-plugin')
const { fastifyRequestContextPlugin } = require('fastify-request-context')

module.exports = fastifyPlugin(async (app) => {
  app.register(fastifyRequestContextPlugin, {
    hook: 'preValidation',
    defaultStoreValues: {
      user: { id: 'system' },
    },
  })
})
