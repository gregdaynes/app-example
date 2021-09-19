const { hash, verify } = require('./hash')
const { assert } = require('chai')

describe('Hash', async function () {
  describe('hash()', async function () {
    it('creates a hash of some data', async function () {
      const data = 'string to hash'
      const [hashedData, salt] = await hash(data)

      assert.typeOf(hashedData, 'string')
      assert.typeOf(salt, 'string')
    })

    it('can take a custom salt', async function () {
      const data = 'string to hash'
      const customSalt = 'testing'
      const [hashedData, salt] = await hash(data, customSalt)

      assert.typeOf(hashedData, 'string')
      assert.typeOf(salt, 'string')
      assert.strictEqual(salt, customSalt)
    })
  })

  describe('verify()', async function () {
    it('can verify a hash was created with data + salt', async function () {
      const data = 'string to hash'
      const [hashedData, salt] = await hash(data)
      const results = await verify(data, hashedData, salt)
      assert.isOk(results)
    })

    it('does not verify a hash was created with data + different salt', async function () {
      const data = 'string to hash'
      const [hashedData] = await hash(data)
      const results = await verify(data, hashedData, 'differentSalt')
      assert.isNotOk(results)
    })
  })
})
