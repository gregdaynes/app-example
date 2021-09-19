const handleError = require('cli-handle-error')
const checkCommandList = require('../utils/check-command-list.js')
const select = require('../utils/select.js')
const { spawn } = require('child_process')

const commandAliases = {
  migrate: 'migrate',
  migration: 'migrate',
  seed: 'seed',
}

module.exports = async ([_, initCommand = null, ...args]) => {
  let [err, command] = checkCommandList(initCommand, commandAliases)
  handleError('INPUT: ', err)

  if (!command) {
    command = await select({
      choices: ['migrate', 'seed'],
      message: 'Choose a database action',
    })
  }

  switch (command) {
    case 'migrate': return await migrate.call(...args)
    case 'seed': return await seed.call(...args)
    default:
  }
}

async function migrate ([initCommand] = [null]) {
  let [err, command] = checkCommandList(initCommand, {
    perform: 'perform available migrations',
    rollback: 'rollback migration',
  })
  handleError('INPUT: ', err)

  command = await select({
    choices: ['perform available migrations', 'rollback migration'],
    message: 'Choose a migration action',
  })
    .then((command) => command.split(' ')[0])

  switch (command) {
    case 'perform': return await migrationsPerform.call()
    case 'rollback': return await migrationsRollback.call()
    default:
  }
}

async function migrationsPerform () {
  const child = spawn('npm', [
    'run',
    'db',
    '--',
    'migrate:latest',
  ])

  child.stdout.on('data', function (data) {
    process.stdout.write(data)
  })

  child.stderr.on('data', function (data) {
    process.stdout.write(data)
  })

  // child.on('exit', function (data) { })
}

async function migrationsRollback () {
  const child = spawn('npm', [
    'run',
    'db',
    '--',
    'migrate:rollback',
  ])

  child.stdout.on('data', function (data) {
    process.stdout.write(data)
  })

  child.stderr.on('data', function (data) {
    process.stdout.write(data)
  })

  // child.on('exit', function (data) { })
}

async function seed ([initCommand] = [null]) {
  let [err, command] = checkCommandList(initCommand, {
    y: 'run',
    yes: 'run',
    run: 'run',
  })
  handleError('INPUT: ', err)

  command = await select({
    choices: ['yes', 'no'],
    message: 'Are you sure?',
  })
    .then((command) => command.split(' ')[0])

  switch (command) {
    case 'yes': return await seedRun.call()
    case 'no':
    default:
  }
}

async function seedRun () {
  const child = spawn('npm', [
    'run',
    'db',
    '--',
    'seed:run',
  ])

  child.stdout.on('data', function (data) {
    process.stdout.write(data)
  })

  child.stderr.on('data', function (data) {
    process.stdout.write(data)
  })

  // child.on('exit', function (data) { })
}
