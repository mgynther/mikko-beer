import { expect } from 'chai'

import axios from 'axios'

import { testConfig } from './test-config'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests
} from '../data/test-helpers'
import { App } from '../../src/web/app'
import { Database } from '../../src/data/database'
import { type User } from '../../src/core/user/user'

import { Level, type log } from '../../src/core/log'

interface LogEntry {
  level: Level
  message: string
}

export class TestContext {
  #app?: App
  #logMessages: LogEntry[] = []

  request = axios.create({
    baseURL: `http://localhost:${testConfig.port}`,
    validateStatus: () => true,
  })

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
    const config = {
      ...testConfig,
      generateInitialAdminPassword: true
    }
    const log: log = (level: Level, ...args: unknown[]) => {
      this.#logMessages.push({
        level,
        message: args.map((a: unknown) => (a as any).toString()).join()
      })
    }
    this.#app = new App(config, log)

    await beforeTest(this.db)
    await this.#app.start()
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

describe('initial admin', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('initial admin sign in works', async () => {
    const messages = ctx.logMessages()
    expect(messages.length).to.be.greaterThan(1)
    const parts = messages[1].message.split('"')
    expect(parts.length).to.equal(5)
    expect(parts[0]).to.contain('Created initial user')
    expect(parts[2]).to.contain('with password')
    const adminUsername = parts[1]
    const adminPassword = parts[3]
    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: adminUsername,
      password: adminPassword,
    })

    expect(res.status).to.equal(200)
    const authToken = res.data.authToken

    // The returned auth token should be usable.
    const getRes = await ctx.request.get<{ user: User }>(
      `/api/v1/user/${res.data.user.id}`,
      {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
    )
    expect(getRes.status).to.equal(200)
    expect(getRes.data.user).to.eql(res.data.user)
  })
})
