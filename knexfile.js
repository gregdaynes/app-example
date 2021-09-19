const Path = require('path')

const {
  DB_CLIENT,
  DB_CONNECTION_TIMEOUT,
  DB_DEBUG,
  DB_POOL_MAX,
  DB_POOL_MIN,
} = process.env

module.exports = {
  client: DB_CLIENT,
  useNullAsDefault: true,
  connectionTimeout: DB_CONNECTION_TIMEOUT || 5000,
  debug: DB_DEBUG || false,
  connection: generateConnection(),
  pool: {
    min: Number(DB_POOL_MIN) || 2,
    max: Number(DB_POOL_MAX) || 5,
  },
  migrations: {
    directory: Path.join(__dirname, 'migrations'),
  },
}

function generateConnection () {
  const {
    DB_DATABASE,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_CONNECTION,
    DB_FILENAME,
  } = process.env

  // Enforce UTC on pool connection level
  // This is an adapter implementation dependent option
  // supported in node-mysql, mysqlijs, mysql2, sqlite3
  // but not supported in NODE-PG, that requires AfterCreate hook
  // https://github.com/knex/knex/issues/97
  const connection = {
    timezone: 'UTC',
  }

  // SQLite memory based connection
  if (DB_CONNECTION === ':memory:') {
    return {
      ...connection,
      filename: DB_CONNECTION,
    }
  }
  if (DB_FILENAME) {
    return {
      ...connection,
      filename: DB_FILENAME,
    }
  }

  return {
    ...connection,
    ...(DB_USER && { user: DB_USER }),
    ...(DB_PASSWORD && { password: DB_PASSWORD }),
    ...(DB_DATABASE && { database: DB_DATABASE }),
    ...(DB_HOST && { host: DB_HOST }),
  }
}
