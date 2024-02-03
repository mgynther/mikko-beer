import { testConfig, testAdminConfig } from './test-config'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests
} from './test-helpers'
import { Database } from '../../src/data/database'

export class TestContext {
  #db?: Database

  get db(): Database {
    return this.#db!
  }

  before = async (): Promise<void> => {
    await beforeTests(testConfig, testAdminConfig)
    this.#db = new Database(testConfig)
  }

  after = async (): Promise<void> => {
    await this.#db?.destroy()
    await afterTests()
  }

  beforeEach = async (): Promise<void> => {
    await beforeTest(this.db)
  }

  afterEach = async (): Promise<void> => {
    await afterTest()
  }
}
