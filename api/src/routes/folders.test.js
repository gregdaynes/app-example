const { database, assert, faker, factories, patterns, helpers } = require('../../test')
const services = require('@aftercoffee/app').services
const build = require('../index.js')

describe('Route /folders', function () {
  let token, organization
  before(async function () {
    await database.setup()
    this.app = await build()
    this.initializeAccountSession = factories.TestAccount.bind(null, this.app.jwt.sign)

    const {
      token: createdToken,
      organization: createdOrganization,
    } = await this.initializeAccountSession()

    token = createdToken
    organization = createdOrganization
  })

  after(async function () {
    await database.teardown()
    await this.app.close()
  })

  describe('POST:/', function () {
    it(
      'creates a folder (with organization from session) and returns the data',
      async function () {
        const response = await this.app.inject({
          method: 'POST',
          url: '/folders',
          cookies: {
            token,
          },
          body: {
            name: 'name',
          },
        })

        assert.strictEqual(response.statusCode, 200)
        assert.match(response.json().id, patterns.uuid)
        assert.strictEqual(response.json().idOrganization, organization.id)
        assert.strictEqual(response.json().name, 'name')
      })

    it('creates a nested folder with a parent folder and returns the data', async function () {
      const seedFolderParent = await factories.Folder({
        name: 'parentFolder',
        idOrganization: organization.id,
      }).insert()

      const response = await this.app.inject({
        method: 'POST',
        url: '/folders',
        cookies: {
          token,
        },
        body: {
          name: 'name',
          idFolderParent: seedFolderParent.id,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.json().idFolderParent, seedFolderParent.id)
    })

    it(`returns 403 Forbidden when a specified parentFolder
        does not belong to the current organization`, async function () {
      const seedFolderParent = await factories.Folder({
        name: 'parentFolder',
        idOrganization: faker.datatype.uuid(),
      }).insert()

      const response = await this.app.inject({
        method: 'POST',
        url: '/folders',
        cookies: {
          token,
        },
        body: {
          name: 'name',
          idFolderParent: seedFolderParent.id,
        },
      })

      assert.strictEqual(response.statusCode, 400)
    })
  })

  describe('GET:/', function () {
    let token, organization
    before(async function () {
      const {
        token: createdToken,
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      token = createdToken
      organization = createdOrganization
    })

    it('returns a list of folders visible to the session', async function () {
      const seedFolder0 = await factories.Folder({ idOrganization: organization.id }).insert()
      const seedFolder1 = await factories.Folder({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/folders',
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.json().length, 2)
      assert.deepInclude(response.json()[0], helpers.omitTimestamps(seedFolder0))
      assert.deepInclude(response.json()[1], helpers.omitTimestamps(seedFolder1))
    })
  })

  describe('GET:/{idFolder}', function () {
    let otherOrganization
    before(async function () {
      const {
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      otherOrganization = createdOrganization
    })

    it('returns specific folder data when visible to the session', async function () {
      const seedFolder = await factories.Folder({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/folders/' + seedFolder.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), helpers.omitTimestamps(seedFolder))
    })

    it('returns specific deleted folder when visible to the session', async function () {
      const seedFolder = await factories.Folder({ idOrganization: organization.id }).insert()

      await services.folder.destroy({
        id: seedFolder.id,
        idOrganization: organization.id,
      })

      const response = await this.app.inject({
        method: 'GET',
        url: '/folders/' + seedFolder.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), helpers.omitTimestamps(seedFolder))
    })
  })

  describe('PUT:/{idFolder}', function () {
    let otherOrganization
    before(async function () {
      const {
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      otherOrganization = createdOrganization
    })

    it('updates an folder with name and returns the updated data', async function () {
      const seedFolder = await factories.Folder({ idOrganization: organization.id }).insert()

      const name = faker.random.word()

      const response = await this.app.inject({
        method: 'PUT',
        url: '/folders/' + seedFolder.id,
        cookies: {
          token,
        },
        body: {
          name,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        id: seedFolder.id,
        name,
      })
    })

    it('does not update a Folder that belongs to another organization', async function () {
      const testFolder = await factories.Folder({
        idOrganization: otherOrganization.id,
      }).insert()

      const name = faker.random.word()

      const response = await this.app.inject({
        method: 'PUT',
        url: '/folders/' + testFolder.id,
        cookies: {
          token,
        },
        body: {
          name,
        },
      })

      // fetch record from db to compare changes made
      const fetchedRecord = await services.folder.fetch({
        id: testFolder.id,
        idOrganization: otherOrganization.id,
      })

      assert.strictEqual(response.statusCode, 200)
      // does not return the object
      assert.deepInclude(response.json(), {})
      // test record was not updated
      assert.notDeepEqual(fetchedRecord.name, name)
    })
  })

  describe('DELETE:/{idFolder}', function () {
    let otherOrganization
    before(async function () {
      const {
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      otherOrganization = createdOrganization
    })

    it('deletes the folder when visible to the session', async function () {
      const seedFolder = await factories.Folder({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/folders/' + seedFolder.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
    })

    it('does not delete a folder that is not visible to the session', async function () {
      const testFolder = await factories.Folder({
        idOrganization: otherOrganization.id,
      }).insert()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/folders/' + testFolder.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 400)
    })
  })
})
