const tables = 'notes'

const categories = [
  'learning',
  'development',
  'art',
  'general',
  'links-references',
  'narration',
]

const json = [
  {
    id: 'a5ec1cf5-e40d-46ae-90f4-1b06dd08df62',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_project: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_type: '874d7911-6caa-4660-963b-7c743b3a769b',
    name: 'Seeded Note Project: - learning',
    category: categories[0],
    content: '{ "data": [] }',
    type: 'project',
  },

  {
    id: '85003c1d-4b76-4d58-9789-34d03f5f16d0',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_project: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_type: '874d7911-6caa-4660-963b-7c743b3a769b',
    name: 'Seeded Note Project - development',
    category: categories[1],
    content: '{ "data": [] }',
    type: 'project',
  },

  {
    id: '6a0ab06b-8ec5-423b-a22b-87abb5de6456',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_project: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_type: '874d7911-6caa-4660-963b-7c743b3a769b',
    name: 'Seeded Note Project - art',
    category: categories[2],
    content: '{ "data": [] }',
    type: 'project',
  },

  {
    id: '56410fac-f569-4988-9574-60e995055116',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_project: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_type: '874d7911-6caa-4660-963b-7c743b3a769b',
    name: 'Seeded Note Project - general',
    category: categories[3],
    content: '{ "data": [] }',
    type: 'project',
  },

  {
    id: '055dd0ee-f502-46c9-88f0-7f0e3b833bba',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_project: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_type: '874d7911-6caa-4660-963b-7c743b3a769b',
    name: 'Seeded Note Project - links-reference',
    category: categories[4],
    content: '{ "data": [] }',
    type: 'project',
  },

  {
    id: 'd0390767-cae6-44e9-9ca3-7d242bc66eae',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_project: '874d7911-6caa-4660-963b-7c743b3a769b',
    id_type: '874d7911-6caa-4660-963b-7c743b3a769b',
    name: 'Seeded Note Project - narration',
    category: categories[5],
    content: '{ "data": [] }',
    type: 'project',
  },
]

exports.seed = async function seed (knex) {
  await knex(tables).del()

  await knex(tables).insert(json)
}
