import { ConnectionConfig } from 'pg'
import { Config } from '../src/config'

export interface TestConfig extends Config {
  readonly adminDatabase: ConnectionConfig
}

export const testConfig: TestConfig = {
  port: 3001,
  authTokenSecret: '26494cafdd9e008ab95e0fb5d02b47ffe77708ecdf2a7804b6',
  authTokenExpiryDuration: '2h',
  database: {
    host: 'localhost',
    database: 'mikko_beer_test',
    user: 'postgres',
  },
  adminDatabase: {
    host: 'localhost',
    database: 'postgres',
    user: 'postgres',
  },
}
