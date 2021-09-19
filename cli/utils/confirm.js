const { Confirm } = require('enquirer')
const shouldCancel = require('cli-should-cancel')
const handleError = require('cli-handle-error')
const { to } = require('await-to-js')

module.exports = async ({ message, value }) => {
  const [err, response] = await to(
    new Confirm({
      message,
    })
      .on('cancel', () => {
        shouldCancel()
      })
      .run(),
  )

  handleError('INPUT: ', err)

  return response
}
