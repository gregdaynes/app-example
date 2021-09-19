exports.provided = function provided (data = {}) {
  if (Object.keys(data).length > 1) throw new Error('Too many attributes')
  const value = Object.entries(data)[0][1]

  return (value) ? data : {}
}

exports.requires = function requires (data = {}) {
  const entries = Object.entries(data)

  entries.forEach(([key, value]) => {
    if (!value) throw new Error(`${key} is required`)
  })

  return true
}
