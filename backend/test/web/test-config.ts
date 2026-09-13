import type { DatabaseConfig } from '../../src/data/database-config.js'
import {
  testConfig as testDataConfig,
  testAdminConfig,
} from '../data/test-config.js'
import type { Config } from '../../src/web/config.js'

export interface TestConfig extends Config {
  readonly adminDatabase: DatabaseConfig
}

export const testConfig: TestConfig = {
  generateInitialAdminPassword: false,
  port: 3002,
  authTokenSecret: '26494cafdd9e008ab95e0fb5d02b47ffe77708ecdf2a7804b6',
  authTokenExpiryDurationMin: 120,
  database: testDataConfig,
  adminDatabase: testAdminConfig,
}
