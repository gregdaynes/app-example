const { database, assert, factories, patterns } = require('../../test')
const services = require('@aftercoffee/app').services
const build = require('../index.js')

describe('Route /notes', function () {
  before(async function () {
    await database.setup()
    this.app = await build()
    this.initializeAccountSession = factories.TestAccount.bind(null, this.app.jwt.sign)
  })

  after(async function () {
    await database.teardown()
    await this.app.close()
  })

  describe('POST:/', function () {
    before(async function () {
      const account = await this.initializeAccountSession()
      this.account = account.account
      this.token = account.token
      this.organization = account.organization
    })

    it('creates a note and returns the data', async function () {
      const testNote = factories.Note({
        idOrganization: this.organization.id,
      })

      const response = await this.app.inject({
        method: 'POST',
        url: '/notes',
        cookies: {
          token: this.token,
        },
        body: testNote,
      })

      assert.strictEqual(response.statusCode, 200)
      assert.match(response.json().id, patterns.uuid)
      assert.deepInclude(response.json(), {
        ...testNote,
        idAccount: this.account.id,
      })
    })
  })

  describe('GET:/', function () {
    before(async function () {
      const account = await this.initializeAccountSession()
      this.account = account.account
      this.token = account.token
      this.organization = account.organization
    })

    it('returns a list of notes visible to the session', async function () {
      const idOrganization = this.organization.id
      const testNoteOne = await factories.Note({
        idOrganization,
        idAccount: this.account.id,
        name: 'test1',
      }).insert()
      const testNoteTwo = await factories.Note({
        idOrganization,
        idAccount: this.account.id,
        name: 'test2',
      }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/notes',
        cookies: {
          token: this.token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.json().length, 2)
      assert.deepInclude(response.json()[0], {
        name: testNoteOne.name,
      })
      assert.deepInclude(response.json()[1], {
        name: testNoteTwo.name,
      })
    })
  })

  describe('GET:/{idNote}', function () {
    before(async function () {
      const account = await this.initializeAccountSession()
      const otherAccount = await this.initializeAccountSession()

      this.account = account.account
      this.token = account.token
      this.organization = account.organization
      this.otherAccount = otherAccount.account
      this.otherOrganization = otherAccount.organization
    })

    it('returns specific note data when visible to the session', async function () {
      const testNote = await factories.Note({
        idOrganization: this.organization.id,
        idAccount: this.account.id,
        name: 'test',
      }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        name: 'test',
      })
    })

    it('returns specific deleted note when visible to the session', async function () {
      const testNote = await factories.Note({
        idOrganization: this.organization.id,
        idAccount: this.account.id,
      }).insert()
      await testNote.delete()

      const response = await this.app.inject({
        method: 'GET',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        id: testNote.id,
      })
    })

    it('returns an empty object when resource is not visible to the session', async function () {
      const testNote = await factories.Note({
        idOrganization: this.otherOrganization.id,
        idAccount: this.otherAccount.id,
      }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {})
    })
  })

  describe('PUT:/{idNote}', function () {
    before(async function () {
      const account = await this.initializeAccountSession()
      const otherAccount = await this.initializeAccountSession()

      this.account = account.account
      this.token = account.token
      this.organization = account.organization
      this.otherAccount = otherAccount.account
      this.otherOrganization = otherAccount.organization
    })

    it('updates a Note with payload and returns the updated data', async function () {
      const testNote = await factories.Note({
        idOrganization: this.organization.id,
        idAccount: this.account.id,
      }).insert()

      const name = 'updated name'

      const response = await this.app.inject({
        method: 'PUT',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
        body: {
          name,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        id: testNote.id,
        name,
      })
    })

    it('does not update a Note that belongs to another organization', async function () {
      const testNote = await factories.Note({
        idOrganization: this.otherOrganization.id,
        idAccount: this.otherAccount.id,
      }).insert()

      const name = 'updated name'

      const response = await this.app.inject({
        method: 'PUT',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
        body: {
          name,
        },
      })

      // fetch record from db to compare changes made
      const fetchedRecord = await services.note.fetch({
        id: testNote.id,
        idOrganization: this.otherOrganization.id,
      })

      assert.strictEqual(response.statusCode, 200)
      // does not return the object
      assert.deepInclude(response.json(), {})
      // test record was not updated
      assert.strictEqual(fetchedRecord[0].name, testNote.name)
      assert.notStrictEqual(fetchedRecord[0].name, name)
    })
  })

  describe('DELETE:/{idNote}', function () {
    before(async function () {
      const account = await this.initializeAccountSession()
      const otherAccount = await this.initializeAccountSession()

      this.account = account.account
      this.token = account.token
      this.organization = account.organization
      this.otherAccount = otherAccount.account
      this.otherOrganization = otherAccount.organization
    })

    it('deletes the note when visible to the session', async function () {
      const testNote = await factories.Note({
        idOrganization: await this.organization.id,
        idAccount: this.account.id,
      }).insert()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
    })

    it('does not delete a note that is not visible to the session', async function () {
      const testNote = await factories.Note({
        idOrganization: this.otherOrganization.id,
        idAccount: this.otherAccount.id,
      }).insert()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/notes/' + testNote.id,
        cookies: {
          token: this.token,
        },
      })

      assert.strictEqual(response.statusCode, 400)
    })
  })
})
