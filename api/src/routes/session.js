const S = require('fluent-json-schema')
const fastifyPlugin = require('fastify-plugin')
const { fetch, verifyPassword } = require('@aftercoffee/app').services.account

module.exports = fastifyPlugin(async (app) => {
  app.post('/session', {
    schema: {
      body: S.object()
        .prop('email', S.string().required())
        .prop('password', S.string().required()),
      response: {
        200: S.object()
          .prop('message', S.string()),
        401: S.object()
          .prop('message', S.string())
          .prop('error', S.string())
          .prop('statusCode', S.number()),
      },
    },
  }, async function handler (request, reply) {
    const app = this
    const { email, password } = request.body

    try {
      const account = await fetch({ email }, { withOrganizations: true })
      await verifyPassword(account, password)

      const token = app.jwt.sign({
        idAccount: account.id,
        displayName: account.displayName,
        idOrganization: account.organizations[0].id,
      })

      reply.setCookie('token', token, {
        path: '/',
        // cookie needs to be accessed by the client
        httpOnly: false,
        sameSite: 'strict',
      })

      return {
        message: 'signed in',
      }
    } catch (err) {
      app.log.error(err)

      // Generic error to avoid enumeration attack
      reply.status(401)
      return {
        message: 'invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      }
    }
  })

  app.delete('/session', {
    schema: {
      response: {
        200: S.null(),
      },
    },
    handler (request, reply) {
      reply
        .clearCookie('token', { path: '/' })
        .send()
    },
  })
})
