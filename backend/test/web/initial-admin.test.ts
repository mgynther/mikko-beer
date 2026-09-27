import { suite, test, before, beforeEach, after, afterEach } from '../test.js'
import { assertDeepEqual, assertEqual, assertIncludes } from '../assert.js'

import { createClient } from './client.js'
import { testConfig } from './test-config.js'
import type { TestConfig } from './test-config.js'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests,
} from '../data/test-helpers.js'
import { App } from '../../src/web/app.js'
import type { StartResult } from '../../src/web/app.js'
import type { Database } from '../../src/data/database.js'
import type { User } from '../../src/logic/user/user.js'

import type { Level } from '../../src/console/log.js'
import type { log } from '../../src/console/log.js'

interface LogEntry {
  level: Level
  message: string
}

export class TestContext {
  #app?: App
  #logMessages: LogEntry[] = []
  readonly #config: TestConfig = {
    ...testConfig,
    generateInitialAdminPassword: true,
  }
  readonly #log: log = (level: Level, ...args: unknown[]) => {
    this.#logMessages.push({
      level,
      message: args.map((a: unknown) => `${a}`).join(),
    })
  }

  request = createClient(`http://localhost:${testConfig.port}`)

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
    this.#logMessages = []
    this.#app = new App(this.#config, this.#log)

    await beforeTest(this.db)
    await this.#app.start()
  }

  // Starts the application again on the same database, as a restart of
  // the server does.
  restart = async (): Promise<StartResult> => {
    await this.#app!.stop()
    this.#app = new App(this.#config, this.#log)
    return await this.#app.start()
  }

  afterEach = async (): Promise<void> => {
    await this.#app?.stop()
    this.#app = undefined
    await afterTest()
  }

  logMessages = () => {
    return this.#logMessages
  }
}

suite('initial admin', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('initial admin sign in works', async () => {
    const createdMessages = ctx
      .logMessages()
      .filter((entry: LogEntry) =>
        entry.message.startsWith('Created initial user'),
      )
    assertEqual(createdMessages.length, 1)
    const parts = createdMessages[0].message.split('"')
    assertEqual(parts.length, 5)
    assertIncludes(parts[2], 'with password')
    const adminUsername = parts[1]
    const adminPassword = parts[3]
    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: adminUsername,
      password: adminPassword,
    })

    assertEqual(res.status, 200)
    const authToken = res.data.authToken

    // The returned auth token is be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      {
        Authorization: `Bearer ${authToken}`,
      },
    )
    assertEqual(getRes.status, 200)
    assertDeepEqual(getRes.data.user, res.data.user)
  })

  test('restart creates no other initial user', async () => {
    const result = await ctx.restart()

    assertDeepEqual(result, { authToken: '', userId: '' })
    assertEqual(
      ctx
        .logMessages()
        .filter((entry: LogEntry) =>
          entry.message.startsWith('Created initial user'),
        ).length,
      1,
    )
  })
})
