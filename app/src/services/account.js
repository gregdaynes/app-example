const Account = require('../models/account')
const { hash, verify } = require('../lib/hash')

module.exports = {
  create,
  fetch,
  verifyPassword,
  addToOrganization,
  list,
}

async function create (data) {
  const {
    email,
    password,
    displayName,
  } = data

  const [hashedPassword, salt] = await hash(password)

  try {
    return await Account.query().insertGraph({
      email,
      password: hashedPassword,
      salt,
      displayName,
    })
  } catch (err) {
    throw new Error(err.nativeError.sqlMessage)
  }
}

async function fetch (data, options = {}) {
  const query = Account.query()
    .where(data)

  if (options.withOrganizations) {
    query.withGraphFetched('organizations')
  }

  const [account] = await query

  if (!account) throw new Error('Account not found')

  return account
}

// ADMINISTRATION ONLY
async function list () {
  return await Account.query()
    .withGraphFetched('organizations')
}

async function verifyPassword (account, challenge) {
  const isValid = await verify(challenge, account.password, account.salt)

  if (!isValid) throw new Error('Invalid password')

  return account
}

async function addToOrganization (account, organization) {
  return account.$relatedQuery('organizations').relate(organization)
}
