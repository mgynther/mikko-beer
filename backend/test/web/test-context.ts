import { v4 as uuidv4 } from 'uuid'

import { createClient } from './client.js'
import type { RequestHeaders } from './client.js'
import { testConfig } from './test-config.js'
import type { TestConfig } from './test-config.js'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests,
} from '../data/test-helpers.js'
import { App } from '../../src/web/app.js'
import type { Database } from '../../src/data/database.js'
import type { Role, User } from '../../src/logic/user/user.js'

import type { Level } from '../../src/console/log.js'
import { type log } from '../../src/console/log.js'

export class TestContext {
  #adminAuthToken: string = ''
  #adminUserId: string = ''
  #app?: App
  #userLogger?: log
  #config: TestConfig

  readonly request: ReturnType<typeof createClient>

  constructor(userLogger?: log, config: TestConfig = testConfig) {
    this.#userLogger = userLogger
    this.#config = config
    this.request = createClient(`http://localhost:${config.port}`)
  }

  get db(): Database {
    return this.#app!.db
  }

  before = async (): Promise<void> => {
    await beforeTests(this.#config.database, this.#config.adminDatabase)
  }

  after = async (): Promise<void> => {
    await afterTests()
  }

  beforeEach = async (): Promise<void> => {
    const logMessages: string[] = []
    const log: log = (
      level: Level,
      ...args: (string | object | Error | unknown)[]
    ) => {
      logMessages.push(
        args
          .map((a: string | object | Error | unknown) => (a ?? '').toString())
          .join(),
      )
      this.#userLogger?.(level, ...args)
    }
    this.#app = new App(this.#config, log)

    await beforeTest(this.db)

    const result = await this.#app.start()
    if (logMessages.some((m: string) => m.toLowerCase().includes('password'))) {
      throw new Error(
        'initial admin password was created although not supposed to',
      )
    }

    this.#adminAuthToken = result.authToken
    this.#adminUserId = result.userId
  }

  afterEach = async (): Promise<void> => {
    await this.#app?.stop()
    this.#app = undefined
    await afterTest()
  }

  adminAuthHeaders = (): RequestHeaders => {
    return this.createAuthHeaders(this.#adminAuthToken)
  }

  adminUserId = (): string => {
    return this.#adminUserId
  }

  // A valid user signed in with a password and nothing more.
  // Neither its values nor how they relate to those of any other result may
  // be assumed: a test that depends on a property sets it in the overrides
  // itself, or reads it back from the result.
  createUser = async (
    overrides: { role?: Role } = {},
  ): Promise<{
    user: User
    authToken: string
    refreshToken: string
    username: string
    password: string
  }> => {
    const userUsername = `testerson_${uuidv4()}`
    const userPassword = uuidv4()
    const res = await this.request.post(
      `/api/v1/user`,
      {
        user: {
          role: overrides.role ?? 'viewer',
        },
        passwordSignInMethod: {
          username: userUsername,
          password: userPassword,
        },
      },
      this.adminAuthHeaders(),
    )

    return {
      ...res.data,
      username: userUsername,
      password: userPassword,
    }
  }

  createAuthHeaders = (authToken: string): RequestHeaders => {
    return {
      Authorization: `Bearer ${authToken}`,
    }
  }
}
