import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import { testConfig } from './test-config'
import {
  afterTest,
  afterTests,
  beforeTest,
  beforeTests
} from '../data/test-helpers'
import { App } from '../../src/web/app'
import { Database } from '../../src/data/database'
import { User } from '../../src/core/user/user'

export class TestContext {
  #adminAuthToken: string = ''
  #app?: App

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
    this.#app = new App(testConfig)

    await beforeTest(this.db)

    const authToken = await this.#app.start()

    this.#adminAuthToken = authToken
  }

  afterEach = async (): Promise<void> => {
    await this.#app?.stop()
    this.#app = undefined
    await afterTest()
  }

  adminAuthHeaders = () => {
    return this.createAuthHeaders(this.#adminAuthToken)
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

  createAuthHeaders = (authToken: string) => {
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  }
}
