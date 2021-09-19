#!/usr/bin/env node

/**
 * app-example-cli
 * Command Interface for App Example
 *
 * @author Gregory Daynes <https://after.coffee>
 */

require('./config')
const init = require('./utils/init.js')
const cli = require('./utils/cli.js')
const log = require('./utils/log.js')
const db = require('../app/src/lib/database.js')
const account = require('./commands/account.js')
const organization = require('./commands/organization.js')
const defaultCommand = require('./commands/default.js')
const database = require('./commands/database.js')

const input = cli.input
const flags = cli.flags
const { clear, debug } = flags

async function handleCommand (input = ['']) {
  const command = (input[0] || '').toLowerCase()
  switch (command) {
    case 'account':
    case 'accounts':
      return await account(input)

    case 'database':
    case 'db':
      return await database(input)

    case 'org':
    case 'orgs':
    case 'organization':
    case 'organizations':
      return await organization(input)

    default:
      return handleCommand([await defaultCommand([
        'Account',
        'Organization',
        'Database',
      ])])
  }
}

;(async () => {
  init({ clear })
  input.includes('help') && cli.showHelp(0)

  await handleCommand(input)

  debug && log.debug(flags)

  await db.destroy()
})()
