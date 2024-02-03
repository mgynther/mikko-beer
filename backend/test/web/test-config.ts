import { ConnectionConfig } from 'pg'
import { testConfig as testDataConfig, testAdminConfig } from '../data/test-config'
import { Config } from '../../src/web/config'

export interface TestConfig extends Config {
  readonly adminDatabase: ConnectionConfig
}

export const testConfig: TestConfig = {
  generateInitialAdminPassword: false,
  port: 3001,
  authTokenSecret: '26494cafdd9e008ab95e0fb5d02b47ffe77708ecdf2a7804b6',
  authTokenExpiryDuration: '2h',
  database: testDataConfig,
  adminDatabase: testAdminConfig
}
