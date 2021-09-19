const envSchema = require('env-schema')
const schema = require('../env.js')
const handleError = require('cli-handle-error')

try {
  module.exports = envSchema({
    schema,
    data: process.env,
  })
} catch (err) {
  handleError('Environment not setup', err)
}
