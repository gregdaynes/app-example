const handleError = require('cli-handle-error')
const Table = require('cli-table')

const checkCommandList = require('../utils/check-command-list.js')
const select = require('../utils/select.js')
const ask = require('../utils/ask.js')
const services = require('../../app/src/services')
const notice = require('../utils/notice.js')

const commandAliases = {
  create: 'create',
  add: 'create',
  list: 'list',
  ls: 'list',
}

module.exports = async ([_, initCommand = null, ...args]) => {
  let [err, command] = checkCommandList(initCommand, commandAliases)
  handleError('INPUT: ', err)

  if (!command) {
    command = await select({
      choices: ['create', 'list'],
      message: 'Choose an Organization command',
    })
  }

  return exports[`${command}`].call(...args)
}

exports.list = async () => {
  const organizations = await services.organization.list()

  const table = new Table({
    head: ['ID', 'Abbreviation', 'Name', 'Deleted'],
  })

  for (const { id, abbreviation, name, deletedAt } of organizations) {
    table.push([
      id,
      abbreviation,
      name,
      !!deletedAt,
    ])
  }

  console.log(table.toString())
}

exports.create = async () => {
  const name = await ask({
    message: 'Organization Name',
  })
  const abbreviation = await ask({ message: 'Organization 4 Character Abbreviation' })

  try {
    const newOrganization = await services.organization.create({
      name,
      abbreviation,
    })

    notice.success('ORGANIZATION', 'Created successfully')
    const table = new Table()
    table.push(
      { id: newOrganization.id },
      { abbreviation },
      { name },
    )

    console.log(table.toString())
  } catch (err) {
    handleError(err.message, err)
  }
}
