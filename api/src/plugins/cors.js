const fastifyCors = require('fastify-cors')
const fastifyPlugin = require('fastify-plugin')

const { ORIGIN } = process.env

module.exports = fastifyPlugin(async (app) => {
  app.register(fastifyCors, {
    credentials: true,
    // This is generally a bad idea, read the follow link to see why
    // https://github.com/nodesecurity/eslint-plugin-security/blob/master/docs/regular-expression-dos-and-node.md
    // In this case, we are providing the pattern through envars at start time which is acceptable
    // eslint-disable-next-line
    origin: new RegExp(`${ORIGIN}`),
  })
})
