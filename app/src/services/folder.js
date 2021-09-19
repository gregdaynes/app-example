const Folder = require('../models/folder')
const { provided, requires } = require('./helpers')

module.exports = {
  create,
  fetch,
  update,
  destroy,
}

async function create ({ id, idFolderParent, name, idOrganization }) {
  if (idFolderParent) {
    const foundFolder = await Folder.query().findById(idFolderParent).where({ idOrganization })
    if (!foundFolder) throw new Error('Parent folder not found')
  }

  const folder = await Folder.query().insert({
    ...provided({ id }),
    name,
    idOrganization,
    ...provided({ idFolderParent }),
  })

  return Folder.query().findById(folder.id)
}

async function fetch ({ id, slug, idOrganization, deleted, withFolderParent }) {
  requires({ idOrganization })

  const query = Folder.query()
    .where({
      idOrganization,
      ...provided({ id }),
      ...provided({ slug }),
    })
    .where(function (builder) {
      if (!deleted) builder.whereNotDeleted()
    })

  if (withFolderParent) {
    query.withGraphFetched('parentFolder')
  }

  return await query
}

async function update ({ id, idOrganization, name, idParentFolder }) {
  requires({
    id,
    idOrganization,
  })

  await Folder.query().where({
    id,
    idOrganization,
  }).patch({
    ...provided({ name }),
    ...provided({ idParentFolder }),
  })

  const folder = await Folder.query().where({
    id,
    idOrganization,
  })

  return folder
}

async function destroy ({ id, idOrganization }) {
  requires({
    id,
    idOrganization,
  })

  return Folder.query().deleteById(id).where({
    idOrganization,
  })
}
