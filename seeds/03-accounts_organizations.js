const json = [
  {
    id_account: '3b9a7e1d-1eb0-40fa-9287-ebd15a7ef977',
    id_organization: '5938b5a3-a1ec-4dfe-9598-2fd6cf496b75',
    is_owner: 1,
  },
  {
    id_account: 'd414f243-266c-4003-aaac-bfcfac309a4f',
    id_organization: 'e364200c-b0ff-4bfc-9133-a232b4313b61',
    is_owner: 0,
  },
]

exports.seed = async function seed (knex) {
  await knex('accounts_organizations').del()
  await knex('accounts_organizations').insert(json)
}
