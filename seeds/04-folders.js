const tables = 'folders'

const json = [
  {
    id: 'c7a76dd3-32f7-4bec-b505-32fb21ae52d7',
    id_folder_parent: null,
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    name: 'My folder',
    slug: 'my-folder',
  },
  {
    id: '4f23dfb7-945b-4333-ae6f-804c924afcf8',
    id_folder_parent: 'c7a76dd3-32f7-4bec-b505-32fb21ae52d7',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    name: 'Child Folder',
    slug: 'child-folder',
  },

  {
    id: '387c5d4b-d639-4b89-a3dd-c91806e4c673',
    id_organization: 'e364200c-b0ff-4bfc-9133-a232b4313b61',
    id_folder_parent: null,
    name: 'A top level folder',
    slug: 'a-top-level-folder',
  },
  {
    id: 'cd5fdeb1-90c1-4192-bede-a19f8328a74d',
    id_folder_parent: '387c5d4b-d639-4b89-a3dd-c91806e4c673',
    id_organization: 'e364200c-b0ff-4bfc-9133-a232b4313b61',
    name: 'A Child Folder',
    slug: 'a-child-folder',
  },
]

exports.seed = async function seed (knex) {
  await knex(tables).del()
  await knex(tables).insert(json)
}
