const slugify = require('slugify')

module.exports = {
  transformAbbreviation,
  transformSlug,
}

function transformAbbreviation (string) {
  return string.toUpperCase().replace(/[\W_]+/g, '_')
}

function transformSlug (string) {
  return slugify(string, {
    lower: true,
    strict: true,
  })
}
