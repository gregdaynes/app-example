const Account = require('./account')
const Organization = require('./organization')
const { database, faker, assert, factories, patterns } = require('../../test')

describe('Account', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  context('created account', function () {
    const account = factories.data.account()

    let testAccount
    before(async function () {
      testAccount = await Account.query().insert(account)
    })

    it('has a uuid for id', function () {
      assert.match(testAccount.id, patterns.uuid)
    })

    it('has a password', function () {
      assert.equal(testAccount.password, account.password)
    })

    it('has a salt', function () {
      assert.equal(testAccount.salt, account.salt)
    })

    it('has a displayName', function () {
      assert.equal(testAccount.displayName, account.displayName)
    })

    it('has a login counter', function () {
      assert.equal(testAccount.numLogins, 0)
    })

    it('has a email verified flag', function () {
      assert.equal(testAccount.isEmailVerified, false)
    })

    it('has an avatar attribute that can be null', function () {
      assert.equal(account.avatar, null)
    })
  })

  context('has required fields', function () {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const salt = faker.datatype.hexaDecimal()
    const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`

    it('requires an email', async function () {
      await assert.isRejected(Account.query().insert({
        password,
        salt,
        displayName,
      }))
    })

    it('requires a password', async function () {
      await assert.isRejected(Account.query().insert({
        email,
        salt,
        displayName,
      }))
    })

    it('requires a salt', async function () {
      await assert.isRejected(Account.query().insert({
        email,
        password,
        displayName,
      }))
    })

    it('requires a displayName', async function () {
      await assert.isRejected(Account.query().insert({
        email,
        password,
        salt,
      }))
    })
  })

  context('associations', function () {
    let testAccount
    let testOrganization
    before(async function () {
      const account = await Account.query().insert(factories.data.account())
      const organization = await Organization.query().insert(factories.data.organization())

      await organization.$relatedQuery('accounts').relate(account)

      testAccount = await Account.query().findById(account.id)
      testOrganization = await Organization.query().findById(organization.id)
    })

    it('has many organization associations', async function () {
      const [foundAccount] = await Account.query()
        .where('accounts.id', testAccount.id)
        .withGraphFetched('organizations')

      const [associatedOrganization] = foundAccount.organizations

      assert.deepEqual(associatedOrganization, testOrganization)
      assert.deepInclude(foundAccount, testAccount)
    })
  })

  context('timestamps', function () {
    const account = factories.data.account()

    let testAccount
    before(async function () {
      testAccount = await Account.query().insert(account)
    })

    it('has created_at and updated_at when inserting', async function () {
      assert.isDefined(testAccount.created_at)
      assert.isDefined(testAccount.updated_at)
      assert.isUndefined(testAccount.deleted_at)
    })

    it('timestamps are camelCase when fetched', async function () {
      const fetchedAccount = await Account.query().findById(testAccount.id)
      assert.isDefined(fetchedAccount.createdAt)
      assert.isDefined(fetchedAccount.updatedAt)
      assert.isNull(fetchedAccount.deletedAt)
    })

    it('alters updated_at when updating a record', async function () {
      const originalAccount = Object.assign({}, { ...testAccount })

      await Account.query()
        .patch({ displayName: 'Testy McTesterson' })
        .where('id', testAccount.id)

      const updatedAccount = await Account.query().findById(testAccount.id)

      assert.notEqual(updatedAccount.updatedAt, originalAccount.updatedAt)
    })

    it('populates deleted_at when deleting a record', async function () {
      await Account.query().deleteById(testAccount.id)
      const deletedAccount = await Account.query().findById(testAccount.id)

      assert.isDefined(deletedAccount.deletedAt)
    })
  })
})
