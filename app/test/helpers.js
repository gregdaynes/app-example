const TIMESTAMP_KEYS = [
  'createdAt',
  'created_at',
  'deletedAt',
  'deleted_at',
  'updatedAt',
  'updated_at',
]

exports.transformTimestamps = function (obj) {
  obj.createdAt = obj.created_at
  obj.updatedAt = obj.updated_at
  obj.deletedAt = obj.deleted_at || null

  delete obj.created_at
  delete obj.updated_at
  delete obj.deleted_at

  return obj
}

exports.omitTimestamps = function (obj = {}, additionalKeys = []) {
  const keys = [
    ...additionalKeys,
    ...TIMESTAMP_KEYS,
  ]

  const filteredObject = Object.entries(obj)
    .filter(([key, value]) => !keys.includes(key))

  return Object.fromEntries(filteredObject)
}

exports.omit = function (obj = {}, paths = []) {
  if (!Array.isArray(paths)) paths = [paths]

  const filteredObject = Object.entries(obj)
    .filter(([key, value]) => !paths.includes(key))

  return Object.fromEntries(filteredObject)
}
