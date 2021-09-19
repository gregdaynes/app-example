const { database, faker, assert, factories, patterns } = require('../../test')
const services = require('@aftercoffee/app').services
const build = require('../index.js')

describe('Route /projects', function () {
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
    it('creates a project and returns the data', async function () {
      const response = await this.app.inject({
        method: 'POST',
        url: '/projects',
        cookies: {
          token,
        },
        body: {
          info: faker.random.words(),
          name: faker.random.word(),
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.match(response.json().id, patterns.uuid)
    })

    it('creates a project in a folder and returns the data', async function () {
      const folder = await factories.Folder({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'POST',
        url: '/projects',
        cookies: {
          token,
        },
        body: {
          idFolder: folder.id,
          info: faker.random.words(),
          name: faker.random.word(),
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.match(response.json().id, patterns.uuid)
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

    it('returns a list of projects visible to the session', async function () {
      const testProjectOne = await factories.Project({ idOrganization: organization.id }).insert()
      const testProjectTwo = await factories.Project({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/projects',
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.json().length, 2)
      assert.deepInclude(response.json()[0], {
        id: testProjectOne.id,
        idFolder: testProjectOne.idFolder,
        name: testProjectOne.name,
        info: testProjectOne.info,
      })
      assert.deepInclude(response.json()[1], {
        id: testProjectTwo.id,
        idFolder: testProjectTwo.idFolder,
        name: testProjectTwo.name,
        info: testProjectTwo.info,
      })
    })
  })

  describe('GET:/{idProject}', function () {
    let otherOrganization
    before(async function () {
      const {
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      otherOrganization = createdOrganization
    })

    it('returns specific project data when visible to the session', async function () {
      const testProject = await factories.Project({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
      })

      delete testProject.deletedAt

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        id: testProject.id,
        idFolder: testProject.idFolder,
        name: testProject.name,
        info: testProject.info,
      })
    })

    it('returns specific deleted project when visible to the session', async function () {
      const testProject = await factories.Project({ idOrganization: organization.id }).insert()

      await services.project.destroy({
        id: testProject.id,
        idOrganization: organization.id,
      })

      const response = await this.app.inject({
        method: 'GET',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        id: testProject.id,
        idFolder: testProject.idFolder,
        name: testProject.name,
        info: testProject.info,
      })
    })

    it('returns an empty object when resource is not visible to the session', async function () {
      const testProject = await factories.Project({ idOrganization: otherOrganization.id }).insert()

      const response = await this.app.inject({
        method: 'GET',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {})
    })
  })

  describe('PUT:/{idProject}', function () {
    let otherOrganization
    before(async function () {
      const {
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      otherOrganization = createdOrganization
    })

    it('updates an Project with payload and returns the updated data', async function () {
      const testProject = await factories.Project({ idOrganization: organization.id }).insert()
      const updatedName = 'updated name'

      const response = await this.app.inject({
        method: 'PUT',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
        body: {
          name: updatedName,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), {
        id: testProject.id,
        name: updatedName,
      })
    })

    it('does not update a project that belongs to another organization', async function () {
      const testProject = await factories.Project({ idOrganization: otherOrganization.id }).insert()
      const updatedName = 'updated name'

      const response = await this.app.inject({
        method: 'PUT',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
        body: {
          name: updatedName,
        },
      })

      // fetch record from db to compare changes made
      const fetchedRecord = await services.project.fetch({
        id: testProject.id,
        idOrganization: otherOrganization.id,
      })

      assert.strictEqual(response.statusCode, 200)
      // does not return the object
      assert.deepInclude(response.json(), {})
      assert.strictEqual(fetchedRecord[0].name, testProject.name)
    })
  })

  describe('DELETE:/{idProject}', function () {
    let otherOrganization
    before(async function () {
      const {
        organization: createdOrganization,
      } = await this.initializeAccountSession()

      otherOrganization = createdOrganization
    })

    it('deletes the project when visible to the session', async function () {
      const testProject = await factories.Project({ idOrganization: organization.id }).insert()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
    })

    it('does not delete a project that is not visible to the session', async function () {
      const testProject = await factories.Project({ idOrganization: otherOrganization.id }).insert()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/projects/' + testProject.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 400)
    })
  })
})
