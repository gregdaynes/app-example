const { writeFile, stat, access, mkdir } = require('fs/promises')
const path = require('path')
const { randomUUID, createHash } = require('crypto')
const Asset = require('../models/asset')
const Organization = require('../models/organization')
const { requires } = require('./helpers')

const STORAGE = process.env.FILE_STORE_PROVIDER
const BASE_DIR = process.env.FILE_STORE_BASE_DIR

const providers = {
  local: providerLocal,
}

module.exports = {
  receive,
  fetch,
}

async function receive ({ idOrganization, idAsset, idProject, data }) {
  requires({
    idProject,
    idOrganization,
    data,
  })

  const organization = await Organization.query().findById(idOrganization)

  // if idAsset not provided, assume a new asset is being created
  idAsset = idAsset || randomUUID()
  // premptively create id for the database record, this is used
  // to create a hash for the file
  const idFile = randomUUID()

  // fetch all file records for asset from database
  const [existingAssetFile] = await Asset.query().where({ idAsset })
    .orderBy('version', 'DESC')
    .limit(1)

  const version = existingAssetFile?.version || 0

  // paths
  const assetHash = hash(idAsset)
  const fileHash = hash(`${idOrganization}-${idAsset}-${idFile}`)
  const filePath = path.join(organization.abbreviation, assetHash, fileHash)

  try {
    const provider = providers[`${STORAGE}`]
    const { storedFilePath, fileSize } = await provider(filePath, data)

    // create record in database
    await Asset.query().insert({
      id: idFile,
      idAsset,
      idOrganization,
      idProject: idProject,
      version: version + 1,
      mimeType: data.mimetype,
      provider: STORAGE,
      fileUrl: storedFilePath,
      fileSize,
    })

    return {
      idAsset,
    }
  } catch (err) {
    throw new Error('Unable to receive file')
  }
}

async function fetch ({ idOrganization, idAsset }) {
  const results = await Asset.query().where({
    idAsset,
    idOrganization,
  })
    .orderBy('version', 'DESC')
    .limit(1)
  if (!results) return {}

  const asset = results[0]

  return {
    filePath: asset.fileUrl,
    mimeType: asset.mimeType,
  }
}

async function providerLocal (filePath, file) {
  const qualifiedFilePath = path.join(BASE_DIR, filePath)
  const dir = path.dirname(qualifiedFilePath)

  try {
    await access(dir)
  } catch {
    await mkdir(dir, { recursive: true })
  }

  try {
    await writeFile(qualifiedFilePath, await file.toBuffer())
    const { size: fileSize } = await stat(qualifiedFilePath)

    return {
      storedFilePath: qualifiedFilePath,
      fileSize,
    }
  } catch (err) {
    throw new Error('Failed to store file')
  }
}

function hash (str) {
  return createHash('md5')
    .update(str)
    .digest('hex')
}
