const build = require('../index.js')
const services = require('@aftercoffee/app').services
const { database, assert, factories, helpers } = require('../../test')

describe('Route /organizations', function () {
  before(async function () {
    await database.setup()
    this.app = await build()
    this.initializeAccountSession = factories.TestAccount.bind(null, this.app.jwt.sign)
  })

  after(async function () {
    await database.teardown()
    await this.app.close()
  })

  describe('GET:/', function () {
    it('returns a list of organizations visible to the session', async function () {
      const { token, account, organization } = await this.initializeAccountSession()
      const { organization: anotherOrganization } = await this.initializeAccountSession()

      await services.account.addToOrganization(account, anotherOrganization)

      const response = await this.app.inject({
        method: 'GET',
        url: '/organizations',
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.json().length, 2)
      assert.deepInclude(response.json()[0], helpers.omitTimestamps(organization))
      assert.deepInclude(response.json()[1], helpers.omitTimestamps(anotherOrganization))
    })
  })

  describe('GET:/{idOrganization}', function () {
    it('returns a specific organizations data when visible to the session', async function () {
      const { token, organization } = await this.initializeAccountSession()
      // secondary organization, we don't want to see this in the results
      await this.initializeAccountSession()

      const response = await this.app.inject({
        method: 'GET',
        url: '/organizations/' + organization.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), helpers.omitTimestamps(organization))
    })

    it('returns a specific deleted organization when visible to the session', async function () {
      const { token, organization } = await this.initializeAccountSession()

      await services.organization.destroy(organization.id)

      const response = await this.app.inject({
        method: 'GET',
        url: '/organizations/' + organization.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.json(), helpers.omitTimestamps(organization))
    })

    it('returns 403 when organization is not visible to the session')
  })

  describe('PUT:/{idOrganization}', function () {
    it(
      'updates an organization with name and/or abbreviation and returns the updated data',
      async function () {
        const { token, organization } = await this.initializeAccountSession()

        const response = await this.app.inject({
          method: 'PUT',
          url: '/organizations/' + organization.id,
          cookies: {
            token,
          },
          body: {
            abbreviation: 'test abbr',
            name: 'test updated name',
          },
        })

        assert.strictEqual(response.statusCode, 200)
        assert.deepInclude(response.json(), {
          id: organization.id,
          abbreviation: 'TEST_ABBR',
          name: 'test updated name',
        })
      },
    )

    it('returns 403 Forbidden when organization requested is not visible to the session')
    it('returns 404 Not Found when updating a deleted organization')
  })

  describe('DELETE:/{idOrganization}', function () {
    it('deletes the organization when visible to the session', async function () {
      const { token, organization } = await this.initializeAccountSession()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/organizations/' + organization.id,
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
    })

    it('returns 403 Forbidden when organization requested is not visible to the session')
    it('rejects with an generic error if unable to delete')
  })

  context('Undefined verbs', function () {
    it('POST:/', async function () {
      const { token } = await this.initializeAccountSession()

      const response = await this.app.inject({
        method: 'POST',
        url: '/organizations',
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 404)
      assert.deepInclude(response.json(), {
        message: 'Route POST:/organizations not found',
        error: 'Not Found',
        statusCode: 404,
      })
    })

    // TODO determine when/how an organization can be created
    //   it('creates an organization with abbreviation and title and returns the data')
    //   it('returns an error when request missing title')
    //   it('returns an error when request missing abbreviation')
    //   it('returns 422 Unprocessable Entity when an abbreviation already exists')
    //   it('returns a generic error')
  })
})
