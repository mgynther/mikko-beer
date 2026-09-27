import { suite, test, before, beforeEach, after, afterEach } from '../test.js'
import { assertDeepEqual, assertRejects } from '../assert.js'

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

import type { Level, log } from '../../src/console/log.js'

interface LogEntry {
  level: Level
  message: string
}

const errorMessage = 'this is error'

export class TestContext {
  readonly #config: TestConfig
  readonly #failingLogMessage: string | undefined
  #app?: App
  #logMessages: LogEntry[] = []

  // The logger throws on a message starting with failingLogMessage, which
  // stands for a failure in whatever start() is doing when it logs it.
  constructor(config: TestConfig, failingLogMessage?: string) {
    this.#config = config
    this.#failingLogMessage = failingLogMessage
  }

  get db(): Database {
    return this.#app!.db
  }

  app = () => {
    return this.#app
  }

  logMessages = () => {
    return this.#logMessages
  }

  before = async (): Promise<void> => {
    await beforeTests(this.#config.database, this.#config.adminDatabase)
  }

  after = async (): Promise<void> => {
    await afterTests()
  }

  beforeEach = async (): Promise<void> => {
    this.#logMessages = []
    const log: log = (level: Level, ...args: unknown[]) => {
      const message = args.map((a: unknown) => `${a}`).join()
      this.#logMessages.push({
        level,
        message,
      })
      if (
        this.#failingLogMessage !== undefined &&
        message.startsWith(this.#failingLogMessage)
      ) {
        throw new Error(errorMessage)
      }
    }
    this.#app = new App(this.#config, log)
    await beforeTest(this.db)
  }

  afterEach = async (): Promise<void> => {
    await this.app()!.stop()
    await afterTest()
  }
}

suite('start error', () => {
  const ctx = new TestContext(
    {
      ...testConfig,
      generateInitialAdminPassword: true,
    },
    'Created initial user',
  )

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('failure to start is logged', async () => {
    await assertRejects(
      async () => {
        await ctx.app()!.start()
      },
      new Error(errorMessage),
      Error,
    )
    const logMessages = ctx.logMessages()
    assertDeepEqual(logMessages[logMessages.length - 1], {
      level: 'ERROR',
      message: 'Error starting,Error: this is error',
    })
  })
})

suite('initial user creation error', () => {
  // Password hash parameters scrypt refuses, as a misconfiguration would
  // have them, fail hashing the initial admin's password inside the
  // transaction that creates the initial user.
  const ctx = new TestContext({
    ...testConfig,
    generateInitialAdminPassword: true,
    passwordHashParameters: { N: 1000, r: 8, p: 1 },
  })

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('failure to create the initial user rejects start', async () => {
    await assertRejects(
      async () => {
        await ctx.app()!.start()
      },
      new Error('unknown error'),
      Error,
    )
    const logMessages = ctx.logMessages()
    assertDeepEqual(logMessages[logMessages.length - 1], {
      level: 'ERROR',
      message: 'Error starting,Error: unknown error',
    })
  })

  test('failure to create the initial user does not start the server', async () => {
    await assertRejects(
      async () => {
        await ctx.app()!.start()
      },
      new Error('unknown error'),
      Error,
    )
    const logMessages = ctx.logMessages()
    assertDeepEqual(
      logMessages.filter((entry: LogEntry) =>
        entry.message.startsWith('Server'),
      ),
      [],
    )
  })
})
