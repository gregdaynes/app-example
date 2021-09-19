const faker = require('faker')
const services = require('@aftercoffee/app').services
const appFactories = require('../../app/test/factories')

module.exports = {
  ...appFactories,

  Token,
  TestAccount,
}

function Token (fn, { account, organization } = {}) {
  if (!fn) throw new Error('Token Factory requires a function to sign the token')

  return fn({
    displayName: account.displayName,
    idAccount: account.id,
    idOrganization: organization.id,
  })
}

async function TestAccount (signFn, { displayName, email, password, abbreviation, name } = {}) {
  displayName = displayName || `${faker.name.firstName()} ${faker.name.lastName()}`
  email = email || faker.internet.email()
  password = password || faker.internet.password()
  abbreviation = abbreviation || `${faker.company.companyName()} ${faker.company.companySuffix()}`
  name = name || faker.company.companyName()

  const createdOrganization = await appFactories.Organization()
  const createdAccount = await appFactories.Account()
  await services.account.addToOrganization(createdAccount, createdOrganization)

  const payload = {
    account: createdAccount,
    organization: createdOrganization,
  }

  if (!signFn) return payload

  const token = Token(signFn, {
    account: createdAccount,
    organization: createdOrganization,
  })

  return {
    account: createdAccount,
    organization: createdOrganization,
    token,
  }
}
