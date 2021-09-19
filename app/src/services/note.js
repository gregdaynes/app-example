const Note = require('../models/note')
const { provided, requires } = require('./helpers')

module.exports = {
  create,
  fetch,
  update,
  destroy,
}

async function create ({ idOrganization, idAccount, idProject, idType, type, category, name, content }) {
  const note = await Note.query().insert({
    idOrganization,
    idAccount,
    idProject,
    idType,
    type,
    category,
    name,
    content,
  })

  return Note.query().findById(note.id)
}

async function fetch (data) {
  const { id, idOrganization, idAccount, idProject, idType, type, deleted } = data
  requires({ idOrganization })

  if (idType && !type) {
    return requires({
      type,
      idType,
    })
  }

  const query = Note.query()
    .where({
      idOrganization,
      ...provided({ id }),
      ...provided({ idProject }),
      ...provided({ idType }),
      ...provided({ type }),
      // Enhancement: we could have private notes if we provide idAccount to this function
      // but will also need to provide some sort of flag indicating that we're only wanting
      // private notes. The api calls this method destructuring request.account which includes
      // the idAccount value, without the flag, and `...provided({ idAccount }) in the where
      // clause of the query, will only allow accounts to fetch their notes.
      // ...provided({ idAccount }),
    })
    .where(function (builder) {
      if (!deleted) builder.whereNotDeleted()
    })

  return await query
}

async function update ({ id, idOrganization, idType, type, name, content }) {
  requires({
    id,
    idOrganization,
  })

  if (content === null) content = {}

  await Note.query().where({
    id,
    idOrganization,
  }).patch({
    ...provided({ idType }),
    ...provided({ type }),
    ...provided({ name }),
    ...provided({ content }),
  })

  const note = await Note.query().where({
    id,
    idOrganization,
  })

  return note
}

async function destroy ({ id, idOrganization }) {
  requires({
    id,
    idOrganization,
  })

  return Note.query().deleteById(id).where({
    idOrganization,
  })
}
