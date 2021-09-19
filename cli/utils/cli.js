const meow = require('meow')
const meowHelp = require('cli-meow-help')

const flags = {
  clear: {
    type: 'boolean',
    default: true,
    alias: 'c',
    desc: 'Clear the console',
  },
  noClear: {
    type: 'boolean',
    default: false,
    desc: 'Don\'t clear the console',
  },
  debug: {
    type: 'boolean',
    default: false,
    alias: 'd',
    desc: 'Print debug info',
  },
  version: {
    type: 'boolean',
    alias: 'v',
    desc: 'Print CLI version',
  },
}

const commands = {
  help: { desc: 'Print help info' },
  account: { desc: 'Perform operations on accounts' },
  'account create': { desc: 'Create a new account and link to an organization' },
  'account list': { desc: 'List all accounts, their associated organization, and status' },
  'account link': { desc: 'Link an existing account to an existing organization' },
  organization: { desc: 'Perform operations on organizations' },
  'organization create': { desc: 'Create a new organization' },
  'organization list': { desc: 'List all organizations, their abbreviation, and status' },
  database: { desc: 'Perform operations on the database' },
  'database migrate': { desc: 'Perform migrations on the database' },
  'database migrate perform': { desc: 'Run all pending migrations' },
  'database migrate rollback': { desc: 'Rollback (Undo) the last migration' },
  'database seed': { desc: 'Perform seed operations on the database with confirmation' },
  'database seed run': { desc: 'Perform seed operation on the database without confirmation' },
}

const helpText = meowHelp({
  name: 'app-example-cli',
  flags,
  commands,
})

const options = {
  inferType: true,
  description: false,
  hardRejection: false,
  flags,
}

module.exports = meow(helpText, options)
