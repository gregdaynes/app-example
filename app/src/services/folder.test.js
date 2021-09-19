const { create, fetch, update, destroy } = require('./folder')
const { database, assert, faker, factories, patterns } = require('../../test')

describe('Services Folder', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  describe('create/1', function () {
    it('persists the folder and returns the stored data', async function () {
      const name = faker.commerce.productName()
      const idOrganization = faker.datatype.uuid()

      const createdFolder = await create({
        name,
        idOrganization,
      })

      assert.deepInclude(createdFolder, {
        name,
        idOrganization,
      })
      assert.match(createdFolder.id, patterns.uuid)
      assert.typeOf(createdFolder.name, 'string')
      assert.match(createdFolder.idOrganization, patterns.uuid)
    })

    it('persists the folder with a parent association', async function () {
      const name = faker.commerce.productName()
      const idOrganization = faker.datatype.uuid()

      const parentFolder = await create({
        name,
        idOrganization,
      })

      const createdFolder = await create({
        name,
        idOrganization,
        idFolderParent: parentFolder.id,
      })

      assert.deepInclude(createdFolder, {
        name,
        idOrganization,
      })
      assert.match(createdFolder.id, patterns.uuid)
      assert.typeOf(createdFolder.name, 'string')
      assert.match(createdFolder.idOrganization, patterns.uuid)
    })

    it('rejects when unable to find idFolderParent', async function () {
      const name = faker.commerce.productName()
      const idOrganization = faker.datatype.uuid()

      await assert.isRejected(create({
        name,
        idOrganization,
        idFolderParent: 'test-bad-parent-id',
      }))
    })

    it('does not intercept errors', async function () {
      const name = faker.commerce.productName()

      await assert.isRejected(create({ name }))
    })
  })

  describe('fetch/1', function () {
    it('returns an empty array if nothing found', async function () {
      const folders = await fetch({
        id: 'does-not-exist',
        idOrganization: faker.datatype.uuid(),
      })

      assert.typeOf(folders, 'array')
      assert.strictEqual(folders.length, 0)
    })

    it('returns a folder by id', async function () {
      const testFolder = await factories.Folder().insert()

      const results = await fetch({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testFolder.id)
      assert.match(results[0].id, patterns.uuid)
      assert.strictEqual(results[0].name, testFolder.name)
    })

    it('returns all folders for organization', async function () {
      const idOrganization = faker.datatype.uuid()
      const testFolderOne = await factories.Folder({ idOrganization }).insert()
      const testFolderTwo = await factories.Folder({ idOrganization }).insert()

      const results = await fetch({ idOrganization })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testFolderOne.id)
      assert.strictEqual(results[1].id, testFolderTwo.id)
    })

    it('does not return deleted folders', async function () {
      const testFolder = await factories.Folder().insert()

      await destroy({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
      })
      const results = await fetch({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.deepEqual(results, [])
    })

    it('has required parameters', async function () {
      await assert.isRejected(fetch())
    })

    it('returns deleted folders when option deleted is true', async function () {
      const testFolder = await factories.Folder().insert()

      await destroy({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
      })
      const results = await fetch({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
        deleted: true,
      })

      assert.typeOf(results, 'array')
      assert.isNotNull(results.deleted_at)
      assert.deepInclude(results[0], {
        id: testFolder.id,
        name: testFolder.name,
        idOrganization: testFolder.idOrganization,
      })
    })

    it(
      'returns folders with their parents when option withFolderParent is true',
      async function () {
        const testFolderParent = await factories.Folder().insert()
        const testFolderChild = await factories.Folder({
          idOrganization: testFolderParent.idOrganization,
          idFolderParent: testFolderParent.id,
        }).insert()

        const results = await fetch({
          id: testFolderChild.id,
          idOrganization: testFolderParent.idOrganization,
          withFolderParent: true,
        })

        assert.typeOf(results, 'array')
        assert.deepInclude(results[0], {
          id: testFolderChild.id,
          name: testFolderChild.name,
          idOrganization: testFolderChild.idOrganization,
        })

        assert.deepInclude(results[0].parentFolder, {
          id: testFolderParent.id,
          name: testFolderParent.name,
          idOrganization: testFolderParent.idOrganization,
        })
      },
    )
  })

  describe('update/1', function () {
    it('can update with new data and returns the folder list', async function () {
      const testFolder = await factories.Folder().insert()
      const name = faker.commerce.productName()

      const results = await update({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
        name,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testFolder.id)
      assert.strictEqual(results[0].name, name)
    })
  })

  describe('destroy/1', function () {
    it('soft deletes the folder', async function () {
      const testFolder = await factories.Folder().insert()

      const results = await destroy({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
      })

      const deletedResult = await fetch({
        id: testFolder.id,
        idOrganization: testFolder.idOrganization,
        deleted: true,
      })

      assert.strictEqual(results, 1)
      assert.isNotNull(deletedResult.deleted_at)
    })

    it('does not delete a Folder that does not match the idOrganization', async function () {
      const testFolder = await factories.Folder().insert()

      const results = await destroy({
        id: testFolder.id,
        idOrganization: 'test-organization-id',
      })

      assert.strictEqual(results, 0)
    })
  })
})
