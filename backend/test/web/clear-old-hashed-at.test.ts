import { describe, it, before, beforeEach, after, afterEach } from 'node:test'
import { assertDeepEqual } from '../assert.js'

import { dummyLog as log } from '../core/dummy-log.js'
import { testConfig } from './test-config.js'
import { afterTest, afterTests, beforeTests } from '../data/test-helpers.js'
import { App } from '../../src/web/app.js'
import type { Database } from '../../src/data/database.js'
import { insertUser } from '../../src/data/user/user.repository.js'
import {
  findPasswordSignInMethod,
  insertPasswordSignInMethod,
} from '../../src/data/user/sign-in-method/sign-in-method.repository.js'

const validDate = new Date()
validDate.setDate(validDate.getDate() - 10)

const oldDate = new Date()
oldDate.setDate(oldDate.getDate() - 18)

function validateUserId(
  id: string | undefined,
  label: 'remainingHashedAtUserId' | 'clearedHashedAtUserId',
): string {
  if (id === undefined) {
    throw new Error(
      `${label} is undefined after setup. There is a bug in test setup.`,
    )
  }
  return id
}

export class TestContext {
  #app?: App
  #remainingHashedAtUserId?: string
  #clearedHashedAtUserId?: string

  get db(): Database {
    return this.#app!.db
  }

  before = async (): Promise<void> => {
    let remainingHashedAtUserId: string | undefined = undefined
    let clearedHashedAtUserId: string | undefined = undefined
    async function initializeData(db: Database): Promise<void> {
      await db.executeReadWriteTransaction(async (trx) => {
        const firstUser = await insertUser(trx, {
          role: 'admin',
          username: 'first-user',
        })
        const firstUserPassword = await insertPasswordSignInMethod(trx, {
          userId: firstUser.id,
          passwordHash:
            '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36',
          hashedAt: validDate,
        })
        remainingHashedAtUserId = firstUserPassword.userId

        const secondUser = await insertUser(trx, {
          role: 'admin',
          username: 'second-user',
        })
        const secondUserPassword = await insertPasswordSignInMethod(trx, {
          userId: secondUser.id,
          passwordHash:
            'c4e457548452abcaf38f97cfce412926:8af0071d2da359277beea4a9c3232d898b975e9ed9170bdea77578667f753f08970144297a5cd9382acbcb9a5341f3e0e0026c1c7d877dcfbce2abd3f528bb9f',
          hashedAt: oldDate,
        })
        clearedHashedAtUserId = secondUserPassword.userId
      })
    }
    await beforeTests(
      testConfig.database,
      testConfig.adminDatabase,
      initializeData,
    )
    this.#remainingHashedAtUserId = validateUserId(
      remainingHashedAtUserId,
      'remainingHashedAtUserId',
    )
    this.#clearedHashedAtUserId = validateUserId(
      clearedHashedAtUserId,
      'clearedHashedAtUserId',
    )
  }

  after = async (): Promise<void> => {
    await afterTests()
  }

  beforeEach = async (): Promise<void> => {
    const config = {
      ...testConfig,
      generateInitialAdminPassword: false,
    }
    this.#app = new App(config, log)
    await this.#app.start()
  }

  afterEach = async (): Promise<void> => {
    await this.#app?.stop()
    this.#app = undefined
    await afterTest()
  }

  remainingHashedAtUserId = (): string => {
    return validateUserId(
      this.#remainingHashedAtUserId,
      'remainingHashedAtUserId',
    )
  }

  clearedHashedAtUserId = (): string => {
    return validateUserId(this.#clearedHashedAtUserId, 'clearedHashedAtUserId')
  }
}

describe('clear old hashed at', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('clear old password hashed at', async () => {
    const remainingHashedAtUserId = ctx.remainingHashedAtUserId()
    const clearedHashedAtUserId = ctx.clearedHashedAtUserId()
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      const remainingHashedAtHash = await findPasswordSignInMethod(
        trx,
        remainingHashedAtUserId,
      )
      assertDeepEqual(remainingHashedAtHash?.hashedAt, validDate)
      const clearedHashedAtHash = await findPasswordSignInMethod(
        trx,
        clearedHashedAtUserId,
      )
      assertDeepEqual(clearedHashedAtHash?.hashedAt, undefined)
    })
  })
})
