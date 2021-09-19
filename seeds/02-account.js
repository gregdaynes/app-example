const tables = 'accounts'

const json = ({ email, display_name, password, salt }) => [
  {
    id: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    email,
    password,
    salt,
    display_name,
    avatar: null,
    num_logins: 0,
    is_email_verified: 1,
  },
  {
    id: 'd414f243-266c-4003-aaac-bfcfac309a4f',
    email: 'fakie.mcfakerson@example.com',
    password:
      'oKTHnVLQCrMgX1Lk9S8Ro2dMzs/OTxWpUZyJwTATsQ1xZiWemh8U5gmddAaw/bnmwwygENRwz7aR52sPMgtI7g==',
    salt: 'GtWOCf2ajzWsPWaFhXe/wg==',
    display_name: 'Fakie McFakerson',
    avatar: null,
    num_logins: 0,
    is_email_verified: 0,
  },
]

exports.seed = async function seed (knex) {
  // Check and retrieve required envars
  const env = knex.context.utils.fetch(process.env, [
    'SEED_ACCOUNT_EMAIL',
    'SEED_ACCOUNT_PASSWORD',
    'SEED_ACCOUNT_DISPLAY_NAME',
  ])

  const [password, salt] = await knex.context.utils.hash(env.SEED_ACCOUNT_PASSWORD)

  await knex(tables).del()

  await knex(tables).insert(
    json({
      email: env.SEED_ACCOUNT_EMAIL,
      display_name: env.SEED_ACCOUNT_DISPLAY_NAME,
      password,
      salt,
    }),
  )
}
