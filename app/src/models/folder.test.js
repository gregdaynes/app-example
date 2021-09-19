// const Folder = require('./folder')
// const Organization = require('./organization')
// const { database, faker, assert, factories, patterns } = require('../../test')
// const { transformSlug } = require('../lib/helpers')
//
// describe.skip('Folder', function () {
//   before(async function () {
//     // await database.setup()
//   })
//
//   after(async function () {
//     // await database.teardown()
//   })
//
//   context.skip('created folder', async function () {
//     const folder = await factories.Folder()
//
//     let testFolder
//     before(async function () {
//       testFolder = await Folder.query().insert(folder)
//     })
//
//     it('has a uuid for id', function () {
//       assert.match(testFolder.id, patterns.uuid)
//     })
//
//     it('has a uuid for idOrganization', function () {
//       assert.match(testFolder.idOrganization, patterns.uuid)
//     })
//
//     it('has a name', function () {
//       assert.strictEqual(testFolder.name, name)
//     })
//
//     it('has a slug based on the name', function () {
//       assert.strictEqual(testFolder.slug, transformSlug(folder.name))
//     })
//
//     it('can have a parent folder', async function () {
//       const nestedFolder = await Folder.query().insert({
//         ...folder,
//         idFolderParent: folder.id,
//       })
//
//       assert.strictEqual(nestedFolder.idFolderParent, folder.id)
//     })
//
//     it('does not require a parent folder', function () {
//       assert.isUndefined(folder.idFolderParent)
//     })
//   })
//
//   context.skip('has required fields', function () {
//     const name = faker.commerce.productName()
//     const idOrganization = faker.datatype.uuid()
//
//     it('requires a name', async function () {
//       await assert.isRejected(Folder.query().insert({
//         idOrganization,
//       }))
//     })
//
//     it('requires an orgaization id', async function () {
//       await assert.isRejected(Folder.query().insert({
//         name,
//       }))
//     })
//   })
//
//   context.skip('parent folder associations', function () {
//     const idOrganization = faker.datatype.uuid()
//
//     let testParentFolder
//     let testChildFolder
//     before(async function () {
//       const parentFolder = await Folder.query().insert({
//         name: 'parent',
//         idOrganization,
//       })
//
//       const childFolder = await Folder.query().insert({
//         name: 'child',
//         idFolderParent: parentFolder.id,
//         idOrganization,
//       })
//
//       testChildFolder = await Folder.query().findById(childFolder.id)
//       testParentFolder = await Folder.query().findById(parentFolder.id)
//     })
//
//     it('child has the parentFolder id', async function () {
//       assert.strictEqual(testChildFolder.idFolderParent, testParentFolder.id)
//     })
//
//     it('can find a parent folder from the child folder', async function () {
//       const fetchedRelatedParentFolder = await testChildFolder.$relatedQuery('parentFolder')
//
//       assert.deepEqual(fetchedRelatedParentFolder, testParentFolder)
//     })
//
//     it('can eager load the parent folder when fetching a child', async function () {
//       const [folder] = await Folder.query()
//         .where('folders.id', testChildFolder.id)
//         .withGraphFetched('parentFolder')
//
//       assert.deepInclude(folder, testChildFolder)
//       assert.deepInclude(folder.parentFolder, testParentFolder)
//     })
//
//     it('can eager load parent folders recursively', async function () {
//       const testFolderTree = await Folder.query().insertGraph({
//         name: 'child',
//         idOrganization,
//         parentFolder: {
//           name: 'parent1',
//           idOrganization,
//           parentFolder: {
//             name: 'parent2',
//             idOrganization,
//             parentFolder: {
//               name: 'parent3',
//               idOrganization,
//             },
//           },
//         },
//       })
//
//       const [folder] = await Folder.query()
//         .where('folders.id', testFolderTree.id)
//         .withGraphFetched('parentFolder.^')
//
//       const child = folder
//       const parent1 = folder.parentFolder
//       const parent2 = folder.parentFolder.parentFolder
//       const parent3 = folder.parentFolder.parentFolder.parentFolder
//
//       assert.strictEqual(child.id, testFolderTree.id)
//       assert.strictEqual(parent1.id, testFolderTree.parentFolder.id)
//       assert.strictEqual(parent2.id, testFolderTree.parentFolder.parentFolder.id)
//       assert.strictEqual(parent3.id, testFolderTree.parentFolder.parentFolder.parentFolder.id)
//     })
//   })
//
//   context.skip('organization association', function () {
//     let testOrganization
//     let testFolder
//     before(async function () {
//       const organization = await factories.Organization()
//       const folder = await factories.Folder({
//         idOrganization: organization.id,
//       }).insert()
//
//       testOrganization = await Organization.query().findById(organization.id)
//       testFolder = await Folder.query().findById(folder.id)
//     })
//
//     it('has an associated organization', async function () {
//       const [foundFolder] = await Folder.query()
//         .where('folders.id', testFolder.id)
//         .withGraphFetched('organization')
//
//       assert.deepEqual(foundFolder.organization, testOrganization)
//       assert.deepInclude(foundFolder, testFolder)
//     })
//   })
//
//   context.skip('timestamps', function () {
//     const name = faker.commerce.productName()
//     const idOrganization = faker.datatype.uuid()
//
//     let folder
//     before(async function () {
//       folder = await Folder.query().insert({
//         name,
//         idOrganization,
//       })
//     })
//
//     it('has created_at and updated_at when inserting', async function () {
//       assert.isDefined(folder.created_at)
//       assert.isDefined(folder.updated_at)
//       assert.isUndefined(folder.deleted_at)
//     })
//
//     it('timestamps are camelCase when fetched', async function () {
//       const fetchedFolder = await Folder.query().findById(folder.id)
//       assert.isDefined(fetchedFolder.createdAt)
//       assert.isDefined(fetchedFolder.updatedAt)
//       assert.isNull(fetchedFolder.deletedAt)
//     })
//
//     it('alters updated_at when updating a record', async function () {
//       const originalFolder = Object.assign({}, { ...folder })
//
//       await Folder.query()
//         .patch({ name: 'Testy McTesterson' })
//         .where('id', folder.id)
//
//       const updatedFolder = await Folder.query().findById(folder.id)
//
//       assert.notEqual(updatedFolder.updatedAt, originalFolder.updatedAt)
//     })
//
//     it('populates deleted_at when deleting a record', async function () {
//       await Folder.query().deleteById(folder.id)
//       const deletedFolder = await Folder.query().findById(folder.id)
//
//       assert.isDefined(deletedFolder.deletedAt)
//     })
//   })
// })
