const { assert } = require('chai')
const build = require('./index')

describe('App', function () {
  before(async function () {
    this.app = await build()
  })

  after(async function () {
    await this.app.close()
  })

  it('Starts a server, and calls `onReady` when ready', async function () {
    this.app.addHook('onReady', function () {
      assert.isOk(true)
    })

    await this.app.ready()
  })
})
