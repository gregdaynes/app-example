const Note = require('./note')
const Organization = require('./organization')
const Account = require('./account')
const Project = require('./project')
const { account } = require('../services')
const { database, assert, factories, patterns } = require('../../test')

describe('Note', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  context('created note', function () {
    before(async function () {
      this.note = await Note.query().insert(factories.Note())
    })

    it('has a correct attribute types', function () {
      assert.match(this.note.id, patterns.uuid)
      assert.match(this.note.idOrganization, patterns.uuid)
      assert.match(this.note.idAccount, patterns.uuid)
      assert.match(this.note.idProject, patterns.uuid)
      assert.match(this.note.idType, patterns.uuid)
      assert.typeOf(this.note.type, 'string')
      assert.typeOf(this.note.category, 'string')
      assert.typeOf(this.note.name, 'string')
      assert.typeOf(this.note.content, 'object')
    })
  })

  context('has required fields', function () {
    it('requires a field', async function () {
      await assert.isRejected(Note.query().insert({}))
    })

    it('has detailed validation messages for required field', async function () {
      let validationErrors

      try {
        await Note.query().insert({})
      } catch (err) {
        validationErrors = Object.fromEntries(
          err.message.split(', ').map((error) => error.split(':')),
        )
      }

      assert.deepEqual(validationErrors, {
        category: ' is a required property',
        content: ' is a required property',
        idAccount: ' is a required property',
        idOrganization: ' is a required property',
        idProject: ' is a required property',
        type: ' is a required property',
      })
    })
  })

  context('associations', function () {
    before(async function () {
      const organization = await factories.Organization()
      const testAccount = await factories.Account()
      account.addToOrganization(account, organization)
      const testProject = await factories.Project({ idOrganization: organization.id }).insert()

      const note = await factories.Note({
        idOrganization: organization.id,
        idAccount: testAccount.id,
        idProject: testProject.id,
      }).insert()

      this.testProject = await Project.query().findById(testProject.id)
      this.testOrganization = await Organization.query().findById(organization.id)
      this.testAccount = await Account.query().findById(testAccount.id)
      this.testNote = await Note.query().findById(note.id)
    })

    it('has a related organization through idOrganization', async function () {
      assert.strictEqual(this.testNote.idOrganization, this.testOrganization.id)
    })

    it('has a related account through idOrganization', async function () {
      assert.strictEqual(this.testNote.idAccount, this.testAccount.id)
    })

    it('can eager load multiple association when fetching a note', async function () {
      const [note] = await Note.query()
        .where('notes.id', this.testNote.id)
        .withGraphFetched('organization')
        .withGraphFetched('account')
        .withGraphFetched('project')

      assert.deepInclude(note, this.testNote)
      assert.deepInclude(note.organization, this.testOrganization)
      assert.deepInclude(note.account, this.testAccount)
      assert.deepInclude(note.project, this.testProject)
    })
  })

  context('timestamps', function () {
    before(async function () {
      this.note = await Note.query().insert(factories.Note())
    })

    it('has created_at and updated_at when inserting', async function () {
      assert.isDefined(this.note.created_at)
      assert.isDefined(this.note.updated_at)
      assert.isUndefined(this.note.deleted_at)
    })

    it('timestamps are camelCase when fetched', async function () {
      const fetchedNote = await Note.query().findById(this.note.id)

      assert.isDefined(fetchedNote.createdAt)
      assert.isDefined(fetchedNote.updatedAt)
      assert.isNull(fetchedNote.deletedAt)
    })

    it('alters updated_at when updating a record', async function () {
      const originalNote = Object.assign({}, { ...this.note })

      const name = 'updated name'

      await Note.query()
        .patch({
          name,
        })
        .where('id', this.note.id)

      const updatedNote = await Note.query().findById(this.note.id)

      assert.notEqual(updatedNote.updatedAt, originalNote.updatedAt)
      assert.strictEqual(updatedNote.name, name)
    })

    it('populates deleted_at when deleting a record', async function () {
      await Note.query().deleteById(this.note.id)
      const deletedNote = await Note.query().findById(this.note.id)

      assert.isDefined(deletedNote.deletedAt)
    })
  })
})
