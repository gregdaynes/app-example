const fastifyPlugin = require('fastify-plugin')
const jwt = require('fastify-jwt')

const { JWT_SECRET } = process.env

module.exports = fastifyPlugin(async (app) => {
  app.register(jwt, {
    secret: JWT_SECRET,
    cookie: { cookieName: 'token' },
  })

  app.addHook('preValidation', async (request, reply) => {
    // Skip authenticating JWT when signing in
    if (request.url === '/session' && request.method !== 'DELETE') return

    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  // expose preValidation step authenticate for routes
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
})
