// const { dim } = require('chalk')
const { Select } = require('enquirer')
const shouldCancel = require('cli-should-cancel')
const handleError = require('cli-handle-error')
const { to } = require('await-to-js')

module.exports = async ({ message, choices }) => {
  const [err, response] = await to(
    new Select({
      message,
      choices,
      // hint: dim('\nUse [space] to select & [enter] to submit.\n'),
      validate (value) {
        return value.length === 0
          ? 'Please select at one.'
          : true
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
