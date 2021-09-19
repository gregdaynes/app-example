const faker = require('faker')
const { assert, use } = require('chai')
use(require('chai-as-promised'))

const factories = require('./factories')
const helpers = require('./helpers')
const patterns = require('./patterns')
const { setup, del, teardown } = require('../src/lib/database').test

module.exports = {
  assert,
  database: {
    setup,
    del,
    teardown,
  },
  helpers,
  factories,
  faker,
  patterns,
}
