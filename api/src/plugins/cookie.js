const fastifyCookie = require('fastify-cookie')
const fastifyPlugin = require('fastify-plugin')

const { COOKIE_SECRET } = process.env

module.exports = fastifyPlugin(async (app) => {
  app.register(fastifyCookie, {
    secret: COOKIE_SECRET,
  })
})
