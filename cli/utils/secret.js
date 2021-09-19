const { Invisible } = require('enquirer')
const shouldCancel = require('cli-should-cancel')
const handleError = require('cli-handle-error')
const { to } = require('await-to-js')

module.exports = async ({ message, value }) => {
  const [err, response] = await to(
    new Invisible({
      message,
      validate (value) {
        return !value ? 'Please specifiy a value.' : true
      },
    })
      .on('cancel', () => {
        shouldCancel()
      })
      .run(),
  )

  handleError('INPUT: ', err)

  return response
}
