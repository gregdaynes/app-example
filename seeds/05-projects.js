const tables = 'projects'

const json = [
  {
    id: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_folder: 'c7a76dd3-32f7-4bec-b505-32fb21ae52d7',
    name: 'Project 1',
    info: 'a seeded project',
  },
  {
    id: '276d9f25-bcb0-4909-b045-8e0d62c62ad2',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_folder: '4f23dfb7-945b-4333-ae6f-804c924afcf8',
    name: 'My Project',
    info: 'Project for Org',
  },
  {
    id: 'bc533ffb-6a83-4be8-92da-9e5b55dfa466',
    id_organization: 'e364200c-b0ff-4bfc-9133-a232b4313b61',
    id_folder: '387c5d4b-d639-4b89-a3dd-c91806e4c673',
    name: 'Some project',
    info: 'Project for other org',
  },
  {
    id: '237d37dc-d7d2-48b5-8bba-176678a46817',
    id_organization: 'e364200c-b0ff-4bfc-9133-a232b4313b61',
    id_folder: 'cd5fdeb1-90c1-4192-bede-a19f8328a74d',
    name: 'Another project',
    info: 'Project for other org',
  },
]

exports.seed = async function seed (knex) {
  await knex(tables).del()
  await knex(tables).insert(json)
}
