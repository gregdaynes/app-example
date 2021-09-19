const faker = require('faker')
const models = require('../src/models')
const services = require('../src/services')
const helpers = require('./helpers')

function insert (service, data) {
  return services[service].create(data).then((response) => helpers.transformTimestamps(response))
}

// Factory Base
function factory (target, defaultProperties) {
  const Model = models[`${target.charAt(0).toUpperCase() + target.slice(1)}`]

  // customizer function to override the default properties
  return function (newProperties) {
    const state = Object.assign({}, defaultProperties, newProperties)

    for (const key of Object.keys(state)) {
      if (typeof state[`${key}`] === 'function') {
        state[`${key}`] = state[`${key}`].call()
      }
    }

    // Extend the factory generated object with `.insert()`
    // to persist to the application data repository
    Object.defineProperty(state, 'insert', {
      value: async function repositoryInsert () {
        const repositoryEntry = await Model.query().insertAndFetch(this)

        // Further extend the entry in the repository with `.delete()`
        Object.defineProperty(repositoryEntry, 'delete', {
          value: async function repositoryDelete () {
            return await Model.query().deleteById(repositoryEntry.id)
          },
        })

        return repositoryEntry
      },
    })

    return state
  }
}

function nullable (data, alt) {
  if (Object.keys(data).length > 1) throw new Error('Too many attributes')
  const [key, value] = Object.entries(data)[0]

  return (value || value === null) ? data : { [key]: alt }
}

function provided (data = {}, alt) {
  if (Object.keys(data).length > 1) throw new Error('Too many attributes')
  const [key, value] = Object.entries(data)[0]

  return (value) ? data : { [key]: alt }
}

exports.data = {}

exports.Organization = async (data) => insert('organization', await exports.data.organization(data))
exports.data.organization = ({ abbreviation, name } = {}) => ({
  ...provided({ abbreviation }, faker.company.companyName()),
  ...provided({ name }, faker.company.companyName()),
})

exports.data.account = ({ displayName, email, password, salt } = {}) => ({
  ...provided({ displayName }, `${faker.name.firstName()} ${faker.name.lastName()}`),
  ...provided({ email }, faker.internet.email()),
  ...provided({ password }, faker.internet.password()),
  ...nullable({ salt }, faker.datatype.hexaDecimal()),
})
exports.Account = async (data) => {
  const accountData = exports.data.account(data)
  const createdAccount = await insert('account', accountData)
  createdAccount.unhashedPassword = accountData.password

  return createdAccount
}

exports.Folder = factory('folder', {
  name: faker.random.word(),
  idFolderParent: null,
  idOrganization: faker.datatype.uuid(),
})

exports.Project = factory('project', {
  info: faker.random.word(),
  name: faker.random.word(),
  idFolder: null,
  idOrganization: faker.datatype.uuid(),
})

exports.Behavior = factory('behavior', {
  idOrganization: faker.datatype.uuid(),
  name: faker.random.word(),
  info: faker.random.words(),
  isTiered: false,
  blank: null,
  parameters: undefined,
})

exports.Lesson = factory('lesson', {
  idOrganization: faker.datatype.uuid(),
  idProject: faker.datatype.uuid(),
  name: faker.random.word(),
  info: faker.random.words(),
})

exports.Script = factory('script', {
  idOrganization: faker.datatype.uuid(),
  type: faker.random.word(),
  steps: faker.datatype.number(),
})

exports.Asset = factory('asset', {
  idAsset: faker.datatype.uuid(),
  idOrganization: faker.datatype.uuid(),
  idProject: faker.datatype.uuid(),
  provider: faker.random.word(),
  mimeType: faker.system.mimeType(),
  fileUrl: faker.image.imageUrl(),
  version: faker.datatype.number(),
  fileSize: faker.datatype.number(),
})

exports.Note = factory('note', {
  idOrganization: faker.datatype.uuid(),
  idAccount: faker.datatype.uuid(),
  idProject: faker.datatype.uuid(),
  idType: faker.datatype.uuid(),
  type: faker.random.word(),
  category: faker.random.word(),
  name: faker.random.word(),
  content: {},
})
