const select = require('../utils/select.js')

module.exports = async (choices) => {
  return await select({
    choices,
    message: 'Choose a command',
  })
}
