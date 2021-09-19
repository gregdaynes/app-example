const Project = require('./project')
const Folder = require('./folder')
const Organization = require('./organization')
const { database, faker, assert, factories, patterns } = require('../../test')

describe('Project', function () {
  before(async function () {
    await database.setup()
  })

  after(async function () {
    await database.teardown()
  })

  context('created project', async function () {
    let testProject
    before(async function () {
      const project = await factories.Project()
      testProject = await Project.query().insert(project)
    })

    it('has a uuid for id', function () {
      assert.match(testProject.id, patterns.uuid)
    })
  })

  context('has required fields', function () {
    it('requires a field', async function () {
      await assert.isRejected(Project.query().insert({}))
    })
  })

  context('associations', function () {
    let testOrganization
    let testFolder
    let testProject
    before(async function () {
      const organization = await factories.Organization()

      const folder = await factories.Folder({ idOrganization: organization.id }).insert()
      const project = await factories.Project({
        idOrganization: organization.id,
        idFolder: folder.id,
      }).insert()

      testOrganization = await Organization.query().findById(organization.id)
      testFolder = await Folder.query().findById(folder.id)
      testProject = await Project.query().findById(project.id)
    })

    it('has a related folder through idFolder', async function () {
      assert.strictEqual(testProject.idFolder, testFolder.id)
    })

    it('has a related organization through idOrganization', async function () {
      assert.strictEqual(testProject.idOrganization, testOrganization.id)
    })

    it('can eager load the folder when fetching a project', async function () {
      const [project] = await Project.query()
        .where('projects.id', testProject.id)
        .withGraphFetched('folder')

      assert.deepInclude(project, testProject)
      assert.deepInclude(project.folder, testFolder)
    })

    it('can eager load the organization when fetching a project', async function () {
      const [project] = await Project.query()
        .where('projects.id', testProject.id)
        .withGraphFetched('organization')

      assert.deepInclude(project, testProject)
      assert.deepInclude(project.organization, testOrganization)
    })

    it('can eager load multiple association when fetching a project', async function () {
      const [project] = await Project.query()
        .where('projects.id', testProject.id)
        .withGraphFetched('organization')
        .withGraphFetched('folder')

      assert.deepInclude(project, testProject)
      assert.deepInclude(project.organization, testOrganization)
      assert.deepInclude(project.folder, testFolder)
    })

    it('can eager load multiple association using joins', async function () {
      const [project] = await Project.query()
        .where('projects.id', testProject.id)
        .withGraphJoined('organization')
        .withGraphJoined('folder')

      assert.deepInclude(project, testProject)
      assert.deepInclude(project.organization, testOrganization)
      assert.deepInclude(project.folder, testFolder)
    })
  })

  context('timestamps', function () {
    let project
    before(async function () {
      project = await Project.query().insert({
        idFolder: faker.datatype.uuid(),
        idOrganization: faker.datatype.uuid(),
        info: faker.random.words(),
        name: faker.random.word(),
      })
    })

    it('has created_at and updated_at when inserting', async function () {
      assert.isDefined(project.created_at)
      assert.isDefined(project.updated_at)
      assert.isUndefined(project.deleted_at)
    })

    it('timestamps are camelCase when fetched', async function () {
      const fetchedProject = await Project.query().findById(project.id)
      assert.isDefined(fetchedProject.createdAt)
      assert.isDefined(fetchedProject.updatedAt)
      assert.isNull(fetchedProject.deletedAt)
    })

    it('alters updated_at when updating a record', async function () {
      const originalProject = Object.assign({}, { ...project })

      await Project.query()
        .patch({ name: 'Testy McTesterson' })
        .where('id', project.id)

      const updatedProject = await Project.query().findById(project.id)

      assert.notEqual(updatedProject.updatedAt, originalProject.updatedAt)
    })

    it('populates deleted_at when deleting a record', async function () {
      await Project.query().deleteById(project.id)
      const deletedProject = await Project.query().findById(project.id)

      assert.isDefined(deletedProject.deletedAt)
    })
  })
})
