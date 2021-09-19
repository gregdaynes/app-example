[[_TOC_]]

## Development

### Getting Started

### Node & NPM

This project uses Node JS as the api/app/cli language.

Node: version in use for development is available in `.nvmrc`

NPM: Always use the most current semver minor version that ships with the  Node version.

#### Environment Variables #envars

The project uses environment variables to provide configuration options. These are available in `.env.js` and `.env`

_Note: `.env` is not commited to the repository. Each value will be different for each location the code will run, conforming to [12FA](https://12factor.net)_

`env.js` will use [JSON Schema](https://json-schema.org) to check the values match what the application expects. This schema also provides safe default values. Each value can be overridden with the value in `.env`. The application will report an error for any missing environment variables on startup.

_Note: The schema for envars should with [fluent-json-schema](//npm.im/fluent-json-schema). This is the same for the API routing, and Application models._

### Project Organization

#### Areas

The project maintains areas, which are the following directories: `app`, `api`, `cli`, and `web`. Each area should maintain it's own packages, requirements, tests, and tooling. This allows us to have a separation of concerns reducing an area's scope. Sometimes referred to [Hexagonal Architecture — Ports Adapters — Clean Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))

`api` & `cli` are dependent on `app`. While `app` & `web` are unaware of eachother, `api`, and `cli`. This allows composition of the applications to meet new requirements.

````mermaid
flowchart LR
    Web-. HTTP Request .-> Api --> App
    CLI --> App
````

#### App

```sh
# run app tests
$ npm run test:app

# run app tests on file change
$ npm run test:app -- --watch
```

App is the core of the application, where the "business logic" lives. App is aware of the database, a file store, and any services needed to perform the functions required.

Intendended to exist as a module used in a higher level consumer  eg: `api`.

```javascript
const { create } = require('@aftercoffee/app').services.account

function createAccount(data) {
  try {
    return await create(data)
  } catch (err) {
    throw new Error(err)
  }
}
```

App also exports `.database` and `.models`. You can use these, but recommended only for edge cases and testing. Using these interfaces will create a tighter coupling between areas. Most likely, you'll only ever need to call `.services` outside the `app` area.

For accessing the database, App uses [Objection](https://vincit.github.io/objection.js) to provide an abstraction over [KnexJS](https://knexjs.org) with transactions, associations, JSON Schema validation and parsing. Defined as models in `app/src/models`.

#### API

```sh
# run api server
$ npm run start:api

# run api tests
$ npm run test:api

# run api tests on file change
$ npm run test:api -- --watch

```
Manages authentication and url routing functions using [fastifyjs](//fastify.io).

_Note: The area does not manage an actual runnable server, that can is `bin/www`._

API provides an autoloader for plugins and routes. `plugins` go in `api/src/plugins` and routes in `api/src/routes`. Load order will be whatever fastify decides. It is important to maintain decoupling. If you need a module loaded before the other, you can specify loading patterns. Check the [fastify docs](//fastify.io)

`routes` defined in a single file per major endpoint, which will contain the RESTful routing definitions. eg `/session` contains POST and DELETE endpoints. They contain no logic, all work will be through the `app.services` modules. The routes route requests and coordinate responses for the `app`.

All Api responses should follow a reasonable structure of
- JSON body
- Headers stating content `application/json`
- Correct HTTP Code. Request error codes following the correct 4**, and system codes 5**.

API routes have JSON Schema using [fluent-json-schema](//npm.im/fluent-json-schema) for:
- receiving requests:
  - validating required params exists
  - parsing/coercing data as necessary
  - removing data not defined.
- sending responses:
  - check response matches schema
  - parsing/coercing data as necessary
  - removing data not defined.
  - redacting sensitive data.

_troubleshooting: If your endpoint is not recieving or responding with a value you expect, check the schema for that api endpoint._

##### Authorization & Authentication - #authz

Api requests are secured with a cookie, containing a [JSON Web Token](//jwt.io). This covers all endpoints except `[GET/POST/PUT] /session`. This Cookie + JWT provides authentication and authorization for each service.

## CLI

```sh
# running guided cli which let you select what to do using arrow keys
$ npm run cli

# print out available commands and descriptions
$ npm run cli -- --help
```

`cli` is an `command-line-interface` that can be accessed from the root of the project using `npm run cli`. CLI consists of a set of commands for managing the application. eg: Creating organizations, Accounts, or running database migrations and seeds.

Commands in `cli/commands` and should work with the application through the `app` module. __Note:__ It should not connect through the API or Web UI.

## Generate Boilerplate Code

```sh
# generate route file
$ npm run generate:api myNewEndpoints

# generate models, services, routes, factories and testing
$ npm run generate:scaffold myNewThing
```

There is an NPM script named `generate:scaffold` that will create all the files necessary for RESTful API sand CRUD operations. It takes a single parameter—the name in camelCase or PascalCase for the feature set you want to generate.

```sh
$ npm run generate:scaffold MyFeature

# Generates
- app
  - models
    - index.js # adds new model to the export list
    - my-feature.js # boilerplate with example code for model
    - my-feature.test.js # boilerplate test file with all tests skipped
  - services
    - index.js # adds new service to the export list
    - my-feature.js # boilerplate with example code for service
    - my-feature.test.js # boilerplate test file with all tests skipped
  - test/factories.js  # adds new factory function
- migrations/[timestamp]_create_my_features_table.js
- api/routes
  - my-feature.js # boilerplate with example code for RESTful routes
  - my-feature.test.js # boilerplate test file with all test skipped
```

`generate:api` exists, to generate an api routing file, without the tests, or any supporting code. This generated route is for designing api request/response data without building the backend. While building a new feature in `web` that uses an api. This way, you can develop without thinking about the `app` until you're ready.

Running a generate command with an existing name, will ask if you would like to replace any existing files. If you use `generate:api`, but later want to add services, models, and testing support, run `generate:scaffold` and say no when asked to replace routes. The result is the same if you ran `generate:scaffold` when you started, but get to keep your routes.

## Testing

```sh
# run all tests
$ npm run test

# run api tests
$ npm run test:api

# run app tests
$ npm run test:app

# each of the above can be set to rerun on file change by passing --watch
$ npm run test:app -- --watch
```

Each area of the project maintains it's own testing setup, this is in `./test`. `App` shares it's database tooling for testing with the `api`.

Tests have access to before and after functions for each test, each context of tests, each test file, and the whole suite.

_Note:_ When writing tests, avoid the use of arrow functions `() => {}` for defining the test callbacks. Due to lexical binding of `this`, and will not have access to data setup in the before block.

## Database

- MySQL 8 for development & production
- SQLite in-memory for testing

### Migrations

```sh
# Perform all pending migrations
$ npm run cli db migrate perform

# Rollback last migration
$ npm run cli db migrate rollback
```

Migrations [KnexJS migrations](https://knexjs.org), run from the `cli` or from `npm run db`.

### Seeds

```sh
$ npm run cli db seed run
```

Seed the database for development is through KnexJS using seed files.

Seeds are in `/app/seeds` and are individual modules named with a priority and an indicator of what the seed data is. The module mist export a function named `seed` that takes a config object.

File Name
```
00-accounts_organizations.js
 ▲ ▲
 │ └─description
 │
 └──order of operation
```

Required Module
```javascript
exports.seed = (config = {}) => {}
```

Seeds use environment variables to provide data based on configuration. This works for things like your account and organization. You can set your environment variables in `.env`

Writing a seed module - the config argument contains the entire knex config. It also contains a `context` property, wwith details about the current process. Data can be added to the context as each seed runs.

The bootstrap seed -- priority 0 -- provides common tooling for the use in other seeds.

Provided tooling like:
- faker -- an instance of fakerjs
- database -- an explicit database connection (note that this is the same as the one in config)
- models -- access to models for working with data
- hash -- the password hashing function from the application
- fetch -- a function to ensure values exist for an object passed in. This is useful for checking and fetching envars
    `const env = utils.fetch(process.env, envars)`
- clearTables -- a function to truncate all data within the set tables.
    `await utils.clearTables(['accounts'])`
