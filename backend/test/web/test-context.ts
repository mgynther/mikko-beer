import { v4 as uuidv4 } from 'uuid'

import { createClient } from './client.js'
import type { RequestHeaders } from './client.js'
import { testConfig } from './test-config.js'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests
} from '../data/test-helpers.js'
import { App } from '../../src/web/app.js'
import { Database } from '../../src/data/database.js'
import { User } from '../../src/core/user/user.js'

import { Level, type log } from '../../src/core/log.js'

export class TestContext {
  #adminAuthToken: string = ''
  #adminUserId: string = ''
  #app?: App
  #userLogger?: log

  constructor (userLogger?: log) {
    this.#userLogger = userLogger
  }

  request = createClient(
    `http://localhost:${testConfig.port}`
  )

  get db(): Database {
    return this.#app!.db
  }

  before = async (): Promise<void> => {
    await beforeTests(testConfig.database, testConfig.adminDatabase)
  }

  after = async (): Promise<void> => {
    await afterTests()
  }

  beforeEach = async (): Promise<void> => {
    const logMessages: string[] = []
    const log: log = (level: Level, ...args: unknown[]) => {
      logMessages.push(
        args.map((a: unknown) => (a as any).toString()).join()
      )
      this.#userLogger?.(level, ...args)
    }
    this.#app = new App(testConfig, log)

    await beforeTest(this.db)

    const result = await this.#app.start()
    if (logMessages.some((m: string) => m.toLowerCase().includes('password'))) {
      throw new Error(
        'initial admin password was created although not supposed to'
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

  adminAuthHeaders = () => {
    return this.createAuthHeaders(this.#adminAuthToken)
  }

  adminUserId = (): string => {
    return this.#adminUserId
  }

  createUser = async (): Promise<{
    user: User
    authToken: string
    refreshToken: string
    username: string
    password: string
  }> => {
    const userUsername = `testerson_${uuidv4()}`
    const userPassword = uuidv4()
    const res = await this.request.post(`/api/v1/user`, {
      user: {
        role: 'viewer'
      },
      passwordSignInMethod: {
        username: userUsername,
        password: userPassword
      },
    },
      this.adminAuthHeaders()
    )

    return {
      ...res.data,
      username: userUsername,
      password: userPassword
    }
  }

  createAuthHeaders = (authToken: string): RequestHeaders => {
    return {
      Authorization: `Bearer ${authToken}`,
    }
  }
}
