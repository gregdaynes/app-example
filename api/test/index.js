const faker = require('faker')
const { assert, use } = require('chai')
use(require('chai-as-promised'))

const factories = require('./factories')
const patterns = require('./patterns')
const { setup, teardown } = require('@aftercoffee/app').database.test
const helpers = require('./helpers')

module.exports = {
  assert,
  database: {
    setup,
    teardown,
  },
  factories,
  faker,
  helpers,
  patterns,
}
