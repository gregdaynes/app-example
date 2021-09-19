const database = require('../lib/database')
const { create, fetch, verifyPassword, addToOrganization } = require('./account')
const organization = require('./organization')
const faker = require('faker')
const { assert, use } = require('chai')
use(require('chai-as-promised'))

const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/

describe('Services Account', function () {
  before(async function () {
    await database.test.setup()
  })

  after(async function () {
    await database.test.teardown()
  })

  describe('create/1', function () {
    it('persists the account and returns the stored data', async function () {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      const createdAccount = await create({
        email,
        password,
        displayName,
      })

      assert.deepInclude(createdAccount, {
        email,
        displayName,
      })
      assert.typeOf(createdAccount.password, 'string')
      assert.typeOf(createdAccount.salt, 'string')
      assert.equal(createdAccount.avatar, null)
      assert.strictEqual(createdAccount.numLogins, 0)
      assert.strictEqual(createdAccount.isEmailVerified, 0)
      assert.match(createdAccount.id, uuidRegex)
    })

    it('does not intercept errors', async function () {
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      await assert.isRejected(create({ displayName }))
    })
  })

  describe('fetch/1', function () {
    it('returns the account from the database with matching email', async function () {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      await create({
        email,
        password,
        displayName,
      })

      const fetchedAccount = await fetch({ email })

      assert.deepInclude(fetchedAccount, {
        email,
        displayName,
      })

      // Ensure return 1 found account
      assert.typeOf(fetchedAccount, 'object') // only return one
      assert.notTypeOf(fetchedAccount, 'array')

      assert.typeOf(fetchedAccount.password, 'string')
      assert.typeOf(fetchedAccount.salt, 'string')
      assert.strictEqual(fetchedAccount.numLogins, 0)
      assert.strictEqual(fetchedAccount.isEmailVerified, 0)
      assert.match(fetchedAccount.id, uuidRegex)
    })

    it('returns the account from the database with matching id', async function () {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      const seedAccount = await create({
        email,
        password,
        displayName,
      })

      const fetchedAccount = await fetch({ id: seedAccount.id })

      assert.deepInclude(fetchedAccount, {
        email,
        displayName,
      })
    })

    it('does not intercept errors', async function () {
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      await assert.isRejected(fetch({ displayName }))
    })
  })

  describe('fetch/2', function () {
    it('returns the account from the database with organizations', async function () {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      const seedOrganization = await organization.create({
        abbreviation: 'ABC123',
        name: 'organization name',
      })

      const seedAccount = await create({
        email,
        password,
        displayName,
      })

      await addToOrganization(seedAccount, seedOrganization)

      const fetchedAccount = await fetch({ id: seedAccount.id }, { withOrganizations: true })

      assert.deepInclude(fetchedAccount, {
        email,
        displayName,
      })
      assert.deepInclude(fetchedAccount.organizations[0], seedOrganization)
    })
  })

  describe('verifyPassword/2', async function () {
    it('returns account if the challenge matches hashed password', async function () {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      const account = await create({
        email,
        password,
        displayName,
      })

      const verificationResult = await verifyPassword(account, password)

      assert.deepEqual(verificationResult, account)
    })

    it("throws an error 'Invalid password' when challenge is not valid", async function () {
      const email = faker.internet.email()
      const password = faker.internet.password()
      const badPassword = 'notThePassword'
      const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

      const account = await create({
        email,
        password,
        displayName,
      })

      await assert.isRejected(verifyPassword(account, badPassword), 'Invalid password')
    })
  })

  describe('addToOrganization/2', async function () {
    let seedOrganization
    let seedAccount
    before(async function () {
      seedOrganization = await organization.create({
        abbreviation: 'ABCD',
        name: faker.company.companyName(),
      })

      seedAccount = await create({
        email: faker.internet.email(),
        password: faker.internet.password(),
        displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
      })
    })
    it('requires an account', async function () {
      await assert.isRejected(addToOrganization(undefined, seedOrganization))
    })

    it('requires an organization', async function () {
      await assert.isRejected(addToOrganization(seedAccount))
    })

    it('creates a relation between account and organization', async function () {
      await assert.isOk(addToOrganization(seedAccount, seedOrganization))
    })
  })
})
