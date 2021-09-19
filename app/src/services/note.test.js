const { create, fetch, update, destroy } = require('./note')
const { database, assert, faker, factories, patterns } = require('../../test')

describe('Services Note', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  describe('create/1', function () {
    it('persists the note and returns the stored data', async function () {
      const note = factories.Note()
      const result = await create({
        ...note,
      })

      assert.match(result.id, patterns.uuid)
      assert.deepInclude(result, note)
    })

    it('strips out additional properties', async function () {
      const note = factories.Note()
      const result = await create({
        ...note,
        junk: true,
        iat: 'test',
      })

      assert.match(result.id, patterns.uuid)
      assert.deepInclude(result, note)
    })

    it('does not intercept errors', async function () {
      await assert.isRejected(create({ }))
    })
  })

  describe('fetch/1', function () {
    it('returns an empty array if nothing found', async function () {
      const results = await fetch({
        id: 'does-not-exist',
        idOrganization: faker.datatype.uuid(),
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results.length, 0)
    })

    it('returns a note by id', async function () {
      const testNote = await factories.Note().insert()

      const results = await fetch({
        id: testNote.id,
        idOrganization: testNote.idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testNote.id)
      assert.match(results[0].id, patterns.uuid)
    })

    describe('attribute filters', function () {
      it('returns all notes for type', async function () {
        const idOrganization = faker.datatype.uuid()
        const testNoteOne = await factories.Note({
          idOrganization,
          type: 'test',
        }).insert()

        await factories.Note({
          idOrganization,
          type: 'test-other',
        }).insert()

        const results = await fetch({
          idOrganization,
          type: 'test',
        })

        assert.typeOf(results, 'array')
        assert.strictEqual(results[0].id, testNoteOne.id)
        assert.strictEqual(results.length, 1)
      })

      it('requires a type when provided with idType', async function () {
        const idOrganization = faker.datatype.uuid()

        await factories.Note({
        }).insert()

        const subject = async () => fetch({
          idOrganization,
          idType: 'test',
        })

        await assert.isRejected(subject())
        assert.eventually.throws(subject(), 'type is required')
      })

      it('returns all notes for account', async function () {
        const idOrganization = faker.datatype.uuid()
        const idAccount = faker.datatype.uuid()
        const testNoteOne = await factories.Note({
          idOrganization,
          idAccount,
        }).insert()

        await factories.Note({
          idOrganization,
        }).insert()

        const results = await fetch({
          idOrganization,
          idAccount,
        })

        assert.typeOf(results, 'array')
        assert.strictEqual(results[0].id, testNoteOne.id)
        assert.strictEqual(results.length, 2)
      })

      it('returns all notes for category', async function () {
        const idOrganization = faker.datatype.uuid()
        const idAccount = faker.datatype.uuid()

        const testNoteOne = await factories.Note({
          idOrganization,
          idAccount,
          category: 'test',
        }).insert()

        await factories.Note({
          idOrganization,
          category: 'otherTest',
        }).insert()

        const results = await fetch({
          idOrganization,
          idAccount,
          category: testNoteOne.category,
        })

        assert.typeOf(results, 'array')
        assert.strictEqual(results[0].id, testNoteOne.id)
        assert.strictEqual(results.length, 2)
      })
    })

    it('does not return deleted notes', async function () {
      const testNote = await factories.Note().insert()
      await testNote.delete()

      const results = await fetch({
        id: testNote.id,
        idOrganization: testNote.idOrganization,
      })

      assert.typeOf(results, 'array')
      assert.deepEqual(results, [])
    })

    it('has required parameters', async function () {
      await assert.isRejected(fetch())
    })

    it('returns deleted notes when option deleted is true', async function () {
      const testNote = await factories.Note().insert()
      await testNote.delete()

      const results = await fetch({
        id: testNote.id,
        idOrganization: testNote.idOrganization,
        deleted: true,
      })

      assert.typeOf(results, 'array')
      assert.isNotNull(results.deleted_at)
      assert.deepInclude(results[0], {
        id: testNote.id,
      })
    })
  })

  describe('update/1', function () {
    it('can update with new data and returns the note list', async function () {
      const testNote = await factories.Note().insert()

      const name = 'updated name'

      const results = await update({
        id: testNote.id,
        idOrganization: testNote.idOrganization,
        name,
      })

      assert.typeOf(results, 'array')
      assert.strictEqual(results[0].id, testNote.id)
      assert.strictEqual(results[0].name, name)
      assert.notStrictEqual(results[0].name, testNote.name)
    })
  })

  describe('destroy/1', function () {
    it('soft deletes the note', async function () {
      const testNote = await factories.Note().insert()

      const { id, idOrganization } = testNote
      const results = await destroy({
        id,
        idOrganization,
      })
      const deletedResult = await fetch({
        id,
        idOrganization,
        deleted: true,
      })

      assert.strictEqual(results, 1)
      assert.isNotNull(deletedResult.deleted_at)
    })

    it('does not delete a Note that does not match the idOrganization', async function () {
      const testNote = await factories.Note().insert()

      const results = await destroy({
        id: testNote.id,
        idOrganization: 'test-organization-id',
      })

      assert.strictEqual(results, 0)
    })
  })
})
