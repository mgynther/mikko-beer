import { expect } from 'chai'

import axios from 'axios'

import { testConfig } from './test-config'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests
} from '../data/test-helpers'
import { App, type StartResult } from '../../src/web/app'
import { Database } from '../../src/data/database'
import { type User } from '../../src/core/user/user'

export class TestContext {
  #app?: App
  #appStartResult?: StartResult

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
    this.#app = new App(config)

    await beforeTest(this.db)
    this.#appStartResult = await this.#app.start()
  }

  afterEach = async (): Promise<void> => {
    await this.#app?.stop()
    this.#app = undefined
    await afterTest()
  }

  adminUsername = () => {
    if (this.#appStartResult === undefined) {
      throw new Error('not started properly')
    }
    return this.#appStartResult.initialAdminUsername
  }

  adminPassword = () => {
    if (this.#appStartResult === undefined) {
      throw new Error('not started properly')
    }
    return this.#appStartResult.initialAdminPassword
  }
}

describe('initial admin', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('initial admin sign in works', async () => {
    const res = await ctx.request.post(`/api/v1/user/sign-in`, {
      username: ctx.adminUsername(),
      password: ctx.adminPassword(),
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
