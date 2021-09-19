const { assert } = require('../../test')
const build = require('../index')

describe('AuthorizeJWT', async function () {
  before(async function () {
    this.app = await build()

    // Add route with validation for testing against
    this.app.get('/test', { preValidation: [this.app.authenticate] }, async (req, reply) => {
      reply.send(true)
    })
  })

  after(async function () {
    await this.app.close()
  })

  it('rejects with 401 when no token supplied', async function () {
    const response = await this.app.inject({
      method: 'get',
      url: '/test',
    })

    assert.strictEqual(response.statusCode, 401)
    assert.deepEqual(response.body, JSON.stringify({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'No Authorization was found in request.cookies',
    }))
  })

  it('rejects with 401 when token signature is manipulated', async function () {
    const token = this.app.jwt.sign({ name: 'test' }) + 'BadSig'

    const response = await this.app.inject({
      method: 'get',
      url: '/test',
      cookies: {
        token,
      },
    })

    assert.strictEqual(response.statusCode, 401)
    assert.deepEqual(response.body, JSON.stringify({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authorization token is invalid: invalid signature',
    }))
  })

  it('rejects with 401 when token header is manipulated', async function () {
    const token = 'badData' + this.app.jwt.sign({ name: 'test' })

    const response = await this.app.inject({
      method: 'get',
      url: '/test',
      cookies: {
        token,
      },
    })

    assert.strictEqual(response.statusCode, 401)
    assert.deepEqual(response.body, JSON.stringify({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authorization token is invalid: invalid token',
    }))
  })

  it('rejects with 401 when token is malformed', async function () {
    const token = 'notAToken'

    const response = await this.app.inject({
      method: 'get',
      url: '/test',
      cookies: {
        token,
      },
    })

    assert.strictEqual(response.statusCode, 401)
    assert.deepEqual(response.body, JSON.stringify({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authorization token is invalid: jwt malformed',
    }))
  })
})
