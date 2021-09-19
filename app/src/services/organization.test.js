const database = require('../lib/database')
const faker = require('faker')
const { create, fetch, update, destroy } = require('./organization')
const { transformAbbreviation } = require('../lib/helpers')
const { assert, use } = require('chai')
use(require('chai-as-promised'))

const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/

const createAbbreviation = () => `${faker.company.companyName()} ${faker.company.companySuffix()}`

describe('Services Organization', function () {
  before(async function () {
    await database.test.setup()
  })

  after(async function () {
    await database.test.teardown()
  })

  describe('create/1', function () {
    it('persists the organization and returns the stored data', async function () {
      const abbreviation = createAbbreviation()
      const name = faker.company.companyName()

      const createdOrganization = await create({
        abbreviation,
        name,
      })

      assert.deepInclude(createdOrganization, {
        abbreviation: transformAbbreviation(abbreviation),
        name,
      })
      assert.match(createdOrganization.id, uuidRegex)
      assert.typeOf(createdOrganization.name, 'string')
    })

    it('does not intercept errors', async function () {
      const name = faker.commerce.productName()

      await assert.isRejected(create({ name }))
    })
  })

  describe('fetch/1', function () {
    it('returns an empty array if nothing found', async function () {
      const organizations = await fetch({ id: 'does-not-exist' })

      assert.typeOf(organizations, 'array')
      assert.strictEqual(organizations.length, 0)
    })

    it('returns an organization by id', async function () {
      const abbreviation = createAbbreviation()
      const name = faker.company.companyName()

      const createdOrganization = await create({
        abbreviation,
        name,
      })

      const fetchedOrganizations = await fetch({ id: createdOrganization.id })

      assert.typeOf(fetchedOrganizations, 'array')
      assert.deepEqual(fetchedOrganizations[0].id, createdOrganization.id)
      assert.match(fetchedOrganizations[0].id, uuidRegex)
      assert.strictEqual(fetchedOrganizations[0].name, name)
    })

    it('returns an organization by abbreviation', async function () {
      const abbreviation = createAbbreviation()
      const name = faker.company.companyName()

      const createdOrganization = await create({
        abbreviation,
        name,
      })

      const fetchedOrganizations = await fetch({
        abbreviation: transformAbbreviation(abbreviation),
      })

      assert.typeOf(fetchedOrganizations, 'array')
      assert.deepEqual(fetchedOrganizations[0].id, createdOrganization.id)
      assert.match(fetchedOrganizations[0].id, uuidRegex)
      assert.strictEqual(
        fetchedOrganizations[0].abbreviation,
        transformAbbreviation(abbreviation),
      )
    })

    it('does not return deleted organizations', async function () {
      const seedOrganization = await create({
        abbreviation: createAbbreviation(),
        name: faker.company.companyName(),
      })

      await destroy(seedOrganization.id)
      const fetchedOrganizations = await fetch({ id: seedOrganization.id })

      assert.typeOf(fetchedOrganizations, 'array')
      assert.deepEqual(fetchedOrganizations, [])
    })

    it('has required parameters', async function () {
      await assert.isRejected(fetch())
    })
  })

  describe('fetch/2', function () {
    it('returns deleted organizations when option deleted is true', async function () {
      const seedOrganization = await create({
        abbreviation: createAbbreviation(),
        name: faker.company.companyName(),
      })

      await destroy(seedOrganization.id)
      const fetchedFolders = await fetch({ id: seedOrganization.id }, { deleted: true })

      assert.typeOf(fetchedFolders, 'array')
      assert.isNotNull(fetchedFolders.deleted_at)
      assert.deepInclude(fetchedFolders[0], {
        id: seedOrganization.id,
        name: seedOrganization.name,
      })
    })
  })

  describe('update/2', function () {
    it('can update with new data and returns the organization list', async function () {
      const abbreviation = faker.company.companyName()
      const name = faker.company.companyName()

      const seedOrganization = await create({
        abbreviation: createAbbreviation(),
        name,
      })

      const updatedOrganizations = await update(seedOrganization.id, {
        name,
      })

      assert.typeOf(updatedOrganizations, 'array')
      assert.strictEqual(updatedOrganizations[0].id, seedOrganization.id)
      assert.strictEqual(updatedOrganizations[0].name, name)
    })
  })

  describe('destroy/1', function () {
    it('soft deletes the organization', async function () {
      const seedOrganization = await create({
        abbreviation: createAbbreviation(),
        name: faker.company.companyName(),
      })

      const results = await destroy(seedOrganization.id)
      const deletedOrganization = await fetch({ id: seedOrganization.id }, { deleted: true })

      assert.strictEqual(results, 1)
      assert.isNotNull(deletedOrganization.deleted_at)
    })
  })
})
