const tables = 'organizations'

const json = ({ SEED_ORGANIZATION_NAME, SEED_ORGANIZATION_ABBREVIATION }) => [
  {
    id: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    name: SEED_ORGANIZATION_NAME,
    abbreviation: SEED_ORGANIZATION_ABBREVIATION,
  },
  {
    id: 'e364200c-b0ff-4bfc-9133-a232b4313b61',
    name: 'Super Fake Organization',
    abbreviation: 'SFO',
  },
]

exports.seed = async function seed (knex) {
  // Check and retrieve required envars
  const env = knex.context.utils.fetch(process.env, [
    'SEED_ORGANIZATION_NAME',
    'SEED_ORGANIZATION_ABBREVIATION',
  ])

  await knex(tables).del()
  await knex(tables).insert(json(env))
}
