const Organization = require('./organization')
const Account = require('./account')
const { database, faker, assert, factories, patterns } = require('../../test')

describe('Organization', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  context('created organization', function () {
    const organization = factories.data.organization()

    let testOrganization
    before(async function () {
      testOrganization = await Organization.query().insert(organization)
    })

    it('has a uuid for id', function () {
      assert.match(testOrganization.id, patterns.uuid)
    })

    it('has an abbreviation that is UPPERCASE with underscores only', function () {
      assert.match(testOrganization.abbreviation, /[A-Z0-9_]+/)
      assert.notMatch(testOrganization.abbreviation, /[a-z\s]+/)
    })

    it('has a name', function () {
      assert.strictEqual(testOrganization.name, organization.name)
    })

    it('rejects when trying to save a non-unique abbreviation', async function () {
      await assert.isRejected(Organization.query().insert({
        name: organization.name,
        abbreviation: organization.abbreviation,
      }))
    })
  })

  context('has required fields', function () {
    const abbreviation = `${faker.company.companyName()} ${faker.company.companySuffix()}`
    const name = faker.company.companyName()

    it('requires an abbreviation', async function () {
      await assert.isRejected(Organization.query().insert({
        name,
      }))
    })

    it('requires a name', async function () {
      await assert.isRejected(Organization.query().insert({
        abbreviation,
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

    it('has many account associations', async function () {
      const [foundOrganization] = await Organization.query()
        .where('organizations.id', testOrganization.id)
        .withGraphFetched('accounts')

      const [associatedAccount] = foundOrganization.accounts

      assert.deepEqual(associatedAccount, testAccount)
      assert.deepInclude(foundOrganization, testOrganization)
    })
  })

  context('timestamps', function () {
    const organization = factories.data.organization()

    let testOrganization
    before(async function () {
      testOrganization = await Organization.query().insert(organization)
    })

    it('has created_at and updated_at when inserting', async function () {
      assert.isDefined(testOrganization.created_at)
      assert.isDefined(testOrganization.updated_at)
      assert.isUndefined(testOrganization.deleted_at)
    })

    it('timestamps are camelCase when fetched', async function () {
      const fetchedOrganization = await Organization.query().findById(testOrganization.id)
      assert.isDefined(fetchedOrganization.createdAt)
      assert.isDefined(fetchedOrganization.updatedAt)
      assert.isNull(fetchedOrganization.deletedAt)
    })

    it('alters updated_at when updating a record', async function () {
      const originalOrganization = Object.assign({}, { ...testOrganization })

      await Organization.query()
        .patch({ name: 'Testy McTesterson' })
        .where('id', testOrganization.id)

      const updatedOrganization = await Organization.query().findById(testOrganization.id)

      assert.notEqual(updatedOrganization.updatedAt, originalOrganization.updatedAt)
    })

    it('populates deleted_at when deleting a record', async function () {
      await Organization.query().deleteById(testOrganization.id)
      const deletedOrganization = await Organization.query().findById(testOrganization.id)

      assert.isDefined(deletedOrganization.deletedAt)
    })
  })
})
