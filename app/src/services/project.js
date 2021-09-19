const Project = require('../models/project')
const Folder = require('../models/folder')
const { provided, requires } = require('./helpers')

module.exports = {
  create,
  fetch,
  update,
  destroy,
}

async function create ({ id, idFolder, info, name, idOrganization } = {}) {
  if (idFolder) {
    const foundFolder = await Folder.query().findById(idFolder).where({ idOrganization })
    if (!foundFolder) throw new Error('Parent folder not found')
  }

  const project = await Project.query().insert({
    ...provided({ id }),
    info,
    name,
    idOrganization,
    ...provided({ idFolder }),
  })

  return Project.query().findById(project.id)
}

async function fetch ({ id, idFolder, idOrganization, deleted }) {
  requires({ idOrganization })

  const query = Project.query()
    .where({
      idOrganization,
      ...provided({ id }),
      ...provided({ idFolder }),
    })
    .where(function (builder) {
      if (!deleted) builder.whereNotDeleted()
    })

  return await query
}

async function update ({ id, idOrganization, info, name }) {
  requires({
    id,
    idOrganization,
  })

  await Project.query().where({
    id,
    idOrganization,
  }).patch({
    ...provided({ info }),
    ...provided({ name }),
  })

  const project = await Project.query().where({
    id,
    idOrganization,
  })

  return project
}

async function destroy ({ id, idOrganization }) {
  requires({
    id,
    idOrganization,
  })

  return Project.query().deleteById(id).where({
    ...provided({ idOrganization }),
  })
}
