const handleError = require('cli-handle-error')
const Table = require('cli-table')

const checkCommandList = require('../utils/check-command-list.js')
const select = require('../utils/select.js')
const ask = require('../utils/ask.js')
const secret = require('../utils/secret.js')
const services = require('../../app/src/services')
const notice = require('../utils/notice.js')
const confirm = require('../utils/confirm.js')

const commandAliases = {
  create: 'create',
  add: 'create',
  list: 'list',
  ls: 'list',
  link: 'link',
}

module.exports.list = async () => {
  const table = new Table({
    head: ['ID', 'Org', 'Name', 'Email', 'Deleted'],
  })

  for (const account of await services.account.list({})) {
    for (const organization of account.organizations) {
      table.push([
        account.id,
        organization.abbreviation,
        account.displayName,
        account.email,
        !!account.deletedAt,
      ])
    }
  }

  console.log(table.toString())
}

exports.create = async () => {
  const orgs = await services.organization.list()
  const lengths = {}
  for (const org of orgs) {
    for (const [key, value] of Object.entries(org)) {
      if (value?.length > (lengths[`${key}`] || 0)) lengths[`${key}`] = value?.length + 2
    }
  }

  const orgChoices = {}
  for (const org of orgs) {
    const abbreviation = `(${org.abbreviation})`.padEnd(lengths.abbreviation)

    orgChoices[`${abbreviation} ${org.name}`] = org.id
  }

  const selectedOrgKey = await select({
    choices: Object.keys(orgChoices),
    message: 'Choose an Organization',
    result (names) {
      return this.map(names)
    },
  })

  const selectedOrgId = orgChoices[`${selectedOrgKey}`]
  const [organization] = await services.organization.fetch({ id: selectedOrgId })

  const displayName = await ask({
    message: 'Display Name',
  })
  const email = await ask({ message: 'Email' })
  const [err, password] = await askPassword()
  handleError('', err)

  try {
    const newAccount = await services.account.create({
      email,
      password,
      displayName,
    })

    await services.account.addToOrganization(newAccount, organization)
    notice.success('ACCOUNT', 'Created successfully')
    const table = new Table()
    table.push(
      { id: newAccount.id },
      { email },
      { displayName },
      { organization: `(${organization.abbreviation}) ${organization.name}` },
    )

    console.log(table.toString())
  } catch (err) {
    handleError(err.message, err)
  }
}

exports.link = async () => {
  const accountChoices = {}
  for (const account of await services.account.list()) {
    accountChoices[account.email] = account
  }

  const accountResult = await select({
    choices: Object.keys(accountChoices),
    message: 'Choose an account',
    result (names) {
      return this.map(names)
    },
  })

  const organizationChoices = {}
  for (const org of await await services.organization.list()) {
    organizationChoices[org.name] = org
  }

  const orgResult = await select({
    choices: Object.keys(organizationChoices),
    message: 'Choose an organization',
    result (names) {
      return this.map(names)
    },
  })

  const account = accountChoices[accountResult]
  const org = organizationChoices[orgResult]

  try {
    await services.account.addToOrganization(account, org)
    notice.success('ACCOUNT<>ORG', 'Linked successfully')
    const table = new Table()
    table.push(
      { email: account.email },
      { displayName: account.displayName },
      { organization: `(${org.abbreviation}) ${org.name}` },
    )

    console.log(table.toString())
  } catch (err) {
    handleError(err.message, err)
  }
}

async function askPassword () {
  const password1 = await secret({ message: 'Password' })
  const password2 = await secret({ message: 'Confirm Password' })

  if (password1 !== password2) {
    notice.error('PASSWORD MISMATCH', 'Passwords do not match')
    const retry = await confirm({
      message: 'Try again',
    })

    if (!retry) return [new Error('password invalid')]

    return askPassword()
  }

  return [null, password1]
}

module.exports = async ([_, initCommand = null, ...args]) => {
  let [err, command] = checkCommandList(initCommand, commandAliases)
  handleError('INPUT: ', err)

  if (!command) {
    command = await select({
      choices: ['create', 'list', 'link'],
      message: 'Choose an Account command',
    })
  }

  return exports[`${command}`].call(...args)
}
