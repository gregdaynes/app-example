const Asset = require('./asset')
const Project = require('./project')
const Organization = require('./organization')
const { database, assert, factories, patterns } = require('../../test')

describe('Asset', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  context('created asset', function () {
    before(async function () {
      this.asset = await Asset.query().insert(factories.Asset())
    })

    it('has a uuid for id', function () {
      assert.match(this.asset.id, patterns.uuid)
    })
  })

  context('has required fields', function () {
    it('requires a field', async function () {
      await assert.isRejected(Asset.query().insert({}))
    })

    it('has detailed validation messages for required field', async function () {
      let validationErrors

      try {
        await Asset.query().insert({})
      } catch (err) {
        validationErrors = Object.fromEntries(
          err.message.split(', ').map((error) => error.split(':')),
        )
      }

      assert.deepEqual(validationErrors, {
        idAsset: ' is a required property',
        idOrganization: ' is a required property',
        idProject: ' is a required property',
        provider: ' is a required property',
        mimeType: ' is a required property',
        fileUrl: ' is a required property',
        version: ' is a required property',
        fileSize: ' is a required property',
      })
    })
  })

  context('associations', function () {
    before(async function () {
      const organization = await factories.Organization()
      const project = await factories.Project({ idOrganization: organization.id }).insert()
      const asset = await factories.Asset({
        idOrganization: organization.id,
        idProject: project.id,
      }).insert()

      this.testOrganization = await Organization.query().findById(organization.id)
      this.testProject = await Project.query().findById(project.id)
      this.testAsset = await Asset.query().findById(asset.id)
    })

    it('has a related organization through idOrganization', async function () {
      assert.strictEqual(this.testAsset.idOrganization, this.testOrganization.id)
    })

    it('can eager load the organization when fetching a asset', async function () {
      const [asset] = await Asset.query()
        .where('assets.id', this.testAsset.id)
        .withGraphFetched('organization')

      assert.deepInclude(asset, this.testAsset)
      assert.deepInclude(asset.organization, this.testOrganization)
    })

    it('can eager load multiple association when fetching a asset', async function () {
      const [asset] = await Asset.query()
        .where('assets.id', this.testAsset.id)
        .withGraphFetched('organization')
        .withGraphFetched('project')

      assert.deepInclude(asset, this.testAsset)
      assert.deepInclude(asset.organization, this.testOrganization)
      assert.deepInclude(asset.project, this.testProject)
    })
  })

  context('files association', function () {
    before(async function () {
      const organization = await factories.Organization()
      const asset = await factories.Asset({
        idOrganization: organization.id,
      }).insert()
      this.file1 = await factories.Asset({
        idOrganization: organization.id,
        idAsset: asset.id,
        version: 1,
      }).insert()
      this.file2 = await factories.Asset({
        idOrganization: organization.id,
        idAsset: asset.id,
        version: 2,
      }).insert()

      this.testOrganization = await Organization.query().findById(organization.id)
      this.testAsset = await Asset.query().findById(asset.id)
    })

    it('can eager load multiple association when fetching a asset', async function () {
      const [asset] = await Asset.query()
        .where('assets.id', this.testAsset.id)
        .withGraphFetched('files')

      assert.deepInclude(asset, this.testAsset)
      assert.strictEqual(asset.files[0].id, this.file1.id)
      assert.strictEqual(asset.files[1].id, this.file2.id)
    })
  })

  context('timestamps', function () {
    before(async function () {
      this.asset = await Asset.query().insert(factories.Asset())
    })

    it('has created_at and updated_at when inserting', async function () {
      assert.isDefined(this.asset.created_at)
      assert.isDefined(this.asset.updated_at)
      assert.isUndefined(this.asset.deleted_at)
    })

    it('timestamps are camelCase when fetched', async function () {
      const fetchedAsset = await Asset.query().findById(this.asset.id)

      assert.isDefined(fetchedAsset.createdAt)
      assert.isDefined(fetchedAsset.updatedAt)
      assert.isNull(fetchedAsset.deletedAt)
    })

    it('alters updated_at when updating a record', async function () {
      const originalAsset = Object.assign({}, { ...this.asset })

      const isDeletable = 1

      await Asset.query()
        .patch({
          isDeletable,
        })
        .where('id', this.asset.id)

      const updatedAsset = await Asset.query().findById(this.asset.id)

      assert.notEqual(updatedAsset.updatedAt, originalAsset.updatedAt)
      assert.strictEqual(updatedAsset.isDeletable, isDeletable)
    })

    it('populates deleted_at when deleting a record', async function () {
      await Asset.query().deleteById(this.asset.id)
      const deletedAsset = await Asset.query().findById(this.asset.id)

      assert.isDefined(deletedAsset.deletedAt)
    })
  })
})
