import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import { assertDeepEqual, assertRejects } from '../assert.js'

import { testConfig } from './test-config.js'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests,
} from '../data/test-helpers.js'
import { App } from '../../src/web/app.js'
import type { Database } from '../../src/data/database.js'

import { Level } from '../../src/core/log.js'
import type { log } from '../../src/core/log.js'

interface LogEntry {
  level: Level
  message: string
}

const errorMessage = 'this is error'

export class TestContext {
  #app?: App
  #logMessages: LogEntry[] = []

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
    await beforeTests(testConfig.database, testConfig.adminDatabase)
  }

  after = async (): Promise<void> => {
    await afterTests()
  }

  beforeEach = async (): Promise<void> => {
    const config = {
      ...testConfig,
      generateInitialAdminPassword: true,
    }
    const log: log = (level: Level, ...args: unknown[]) => {
      const message = args.map((a: unknown) => `${a}`).join()
      this.#logMessages.push({
        level,
        message,
      })
      if (message.startsWith('Created initial user')) {
        throw new Error(errorMessage)
      }
    }
    this.#app = new App(config, log)
    await beforeTest(this.db)
  }

  afterEach = async (): Promise<void> => {
    await this.app()!.stop()
    await afterTest()
  }
}

describe('start error', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('failure to start is logged', async () => {
    await assertRejects(
      async () => {
        await ctx.app()!.start()
      },
      new Error(errorMessage),
      Error,
    )
    const logMessages = ctx.logMessages()
    assertDeepEqual(logMessages[logMessages.length - 1], {
      level: Level.ERROR,
      message: 'Error starting,Error: this is error',
    })
  })
})
