const build = require('../index.js')
const { database, assert, factories, patterns } = require('../../test')

describe('Route /session', function () {
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
    it('requires email address', async function () {
      const response = await this.app.inject({
        method: 'POST',
        url: '/session',
        body: {},
      })

      assert.strictEqual(response.statusCode, 400)
      assert.deepInclude(response.json(), {
        message: "body should have required property 'email'",
        error: 'Bad Request',
        statusCode: 400,
      })
    })

    it('requires password', async function () {
      const response = await this.app.inject({
        method: 'POST',
        url: '/session',
        body: {
          email: 'test@test.com',
        },
      })

      assert.strictEqual(response.statusCode, 400)
      assert.deepInclude(response.json(), {
        message: "body should have required property 'password'",
        error: 'Bad Request',
        statusCode: 400,
      })
    })

    it('returns an fuzzy error when account does not exist', async function () {
      const response = await this.app.inject({
        method: 'POST',
        url: '/session',
        body: {
          email: 'test@example.com',
          password: 'abc123',
        },
      })

      assert.deepInclude(response.json(), {
        message: 'invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      })
    })

    it('it creates a new session and returns cookie with JWT', async function () {
      const { organization, account } = await this.initializeAccountSession()

      const response = await this.app.inject({
        method: 'POST',
        url: '/session',
        body: {
          email: account.email,
          password: account.unhashedPassword,
        },
      })
      const parsedToken = this.app.jwt.decode(response.cookies[0].value)

      assert.strictEqual(response.statusCode, 200)
      assert.deepInclude(response.cookies[0], {
        name: 'token',
        path: '/',
      })
      assert.deepInclude(parsedToken, {
        displayName: account.displayName,
        idAccount: account.id,
        idOrganization: organization.id,
      })
      assert.match(parsedToken.idAccount, patterns.uuid)
    })
  })

  describe('DELETE:/', async function () {
    it('returns unauthorized if no token provided', async function () {
      const response = await this.app.inject({
        method: 'DELETE',
        url: '/session',
      })

      assert.strictEqual(response.statusCode, 401)
      assert.deepEqual(response.json(), {
        error: 'Unauthorized',
        message: 'No Authorization was found in request.cookies',
        statusCode: 401,
      })
    })

    it('sets the cookie as expired on response', async function () {
      const { token } = await this.initializeAccountSession()
      const now = new Date()

      const response = await this.app.inject({
        method: 'DELETE',
        url: '/session',
        cookies: {
          token,
        },
      })

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(response.cookies[0].value, '')
      assert.isTrue(response.cookies[0].expires < now)
    })
  })

  context('Undefined verbs', function () {
    it('GET:/', async function () {
      const response = await this.app.inject({
        method: 'GET',
        url: '/session',
      })

      assert.strictEqual(response.statusCode, 404)
      assert.deepInclude(response.json(), {
        message: 'Route GET:/session not found',
        error: 'Not Found',
        statusCode: 404,
      })
    })

    it('PUT:/', async function () {
      const response = await this.app.inject({
        method: 'PUT',
        url: '/session',
      })

      assert.strictEqual(response.statusCode, 404)
      assert.deepInclude(response.json(), {
        message: 'Route PUT:/session not found',
        error: 'Not Found',
        statusCode: 404,
      })
    })

    it('PATCH:/', async function () {
      const response = await this.app.inject({
        method: 'PATCH',
        url: '/session',
      })

      assert.strictEqual(response.statusCode, 404)
      assert.deepInclude(response.json(), {
        message: 'Route PATCH:/session not found',
        error: 'Not Found',
        statusCode: 404,
      })
    })
  })
})
