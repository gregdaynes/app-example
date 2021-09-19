const { create, fetch, update, destroy } = require('./project')
const { database, assert, faker, factories, patterns } = require('../../test')

describe('Services Project', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  describe('create/1', function () {
    it('persists the project and returns the stored data', async function () {
      const folder = factories.Folder().insert()

      const result = await create({
        idFolder: folder.id,
        info: faker.random.words(),
        name: faker.random.word(),
        idOrganization: faker.datatype.uuid(),
      })

      assert.deepInclude(result, {})
      assert.match(result.id, patterns.uuid)
    })

    it('does not intercept errors', async function () {
      await assert.isRejected(create({ }))
    })
  })

  describe('fetch/1', function () {
    it('returns an empty array if nothing found', async function () {
      const results = await fetch({
        id: 'does-not-exist',
        idOrganization: 'does-not-exist-either',
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results.length, 0)
    })

    it('returns a project by id', async function () {
      const testProject = await factories.Project().insert()

      const results = await fetch({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testProject.id)
      assert.match(results[0].id, patterns.uuid)
      assert.strictEqual(results[0].name, testProject.name)
    })

    it('returns all projects for folder', async function () {
      const idOrganization = faker.datatype.uuid()
      const folder = await factories.Folder({ idOrganization }).insert()

      const testProjectOne = await factories.Project({
        idFolder: folder.id,
        idOrganization,
      }).insert()

      const testProjectTwo = await factories.Project({
        idFolder: folder.id,
        idOrganization,
      }).insert()

      const results = await fetch({
        idFolder: folder.id,
        idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testProjectOne.id)
      assert.strictEqual(results[1].id, testProjectTwo.id)
    })

    it('does not return deleted projects', async function () {
      const testProject = await factories.Project().insert()

      await destroy({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
      })
      const results = await fetch({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.deepEqual(results, [])
    })

    it('has required parameters', async function () {
      await assert.isRejected(fetch())
    })
  })

  describe('fetch/2', function () {
    it('returns deleted projects when option deleted is true', async function () {
      const testProject = await factories.Project().insert()

      await destroy({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
      })
      const results = await fetch({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
        deleted: true,
      })

      assert.typeOf(results, 'array')
      assert.isNotNull(results.deleted_at)
      assert.deepInclude(results[0], {
        id: testProject.id,
      })
    })
  })

  describe('update/2', function () {
    it('can update with new data and returns the project list', async function () {
      const testProject = await factories.Project().insert()

      const newName = faker.random.word()
      const results = await update({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
        name: newName,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testProject.id)
      assert.strictEqual(results[0].name, newName)
    })
  })

  describe('destroy/1', function () {
    it('soft deletes the project', async function () {
      const testProject = await factories.Project().insert()

      const results = await destroy({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
      })
      const deletedResult = await fetch({
        id: testProject.id,
        idOrganization: testProject.idOrganization,
        deleted: true,
      })

      assert.strictEqual(results, 1)
      assert.isNotNull(deletedResult.deleted_at)
    })

    it('does not delete a project that does not match the idOrganization', async function () {
      const testProject = await factories.Project().insert()

      const results = await destroy({
        id: testProject.id,
        idOrganization: 'test-organization-id',
      })

      assert.strictEqual(results, 0)
    })
  })
})
