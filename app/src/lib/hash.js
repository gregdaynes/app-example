const crypto = require('crypto')
const { Buffer } = require('buffer')
const { promisify } = require('util')

const scrypt = promisify(crypto.scrypt)
const randomBytes = promisify(crypto.randomBytes)

module.exports = {
  hash,
  verify,
}

async function hash (data, customSalt) {
  const salt = customSalt || await randomBytes(16)
    .then((buffer) => buffer.toString('base64'))

  const hashedData = await scrypt(data, salt, 64)
    .then((buffer) => buffer.toString('base64'))

  return [
    hashedData,
    salt,
  ]
}

async function verify (data, oldHash, salt) {
  const [newHash] = await hash(data, salt)

  const a = Buffer.from(newHash)
  const b = Buffer.from(oldHash)

  return crypto.timingSafeEqual(a, b) && true
}
