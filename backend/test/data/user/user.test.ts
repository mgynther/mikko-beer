import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../test.js'

import { TestContext } from '../test-context.js'
import type { NewUser, User } from '../../../src/data/user/user.repository.js'
import * as userRepository from '../../../src/data/user/user.repository.js'
import type { Transaction } from '../../../src/data/database.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'

suite('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  const user: NewUser = {
    username: 'user',
    role: 'admin',
  }

  async function insertUser(): Promise<User> {
    return await ctx.db.executeReadWriteTransaction(async (trx) => {
      return await userRepository.insertUser(trx, { ...user })
    })
  }

  test('insert user', async () => {
    const insertedUser = await insertUser()
    assertEqual(insertedUser.username, user.username)
    assertEqual(insertedUser.role, user.role)
  })

  test('find user', async () => {
    const insertedUser = await insertUser()
    const foundUser = await userRepository.findUserById(ctx.db, insertedUser.id)
    assertDeepEqual(foundUser, insertedUser)
  })

  test('do not find user that does not exist', async () => {
    const userId = '35370921-5d47-4274-a5cc-9fe0246d74e5'
    const foundUser = await userRepository.findUserById(ctx.db, userId)
    assertEqual(foundUser, undefined)
  })

  test('list users', async () => {
    const insertedUser = await insertUser()
    const users = await userRepository.listUsers(ctx.db)
    assertDeepEqual(users, [insertedUser])
  })

  test('list users by username, users without one last', async () => {
    const [matti, anonymous, liisa] = await ctx.db.executeReadWriteTransaction(
      async (trx) => [
        await userRepository.insertUser(trx, {
          username: 'matti',
          role: 'viewer',
        }),
        await userRepository.createAnonymousUser(trx, { role: 'admin' }),
        await userRepository.insertUser(trx, {
          username: 'liisa',
          role: 'viewer',
        }),
      ],
    )
    const users = await userRepository.listUsers(ctx.db)
    assertDeepEqual(users, [liisa, matti, anonymous])
  })

  test('do not list users when there are none', async () => {
    const users = await userRepository.listUsers(ctx.db)
    assertDeepEqual(users, [])
  })

  async function testLocking(
    lockFunc: (trx: Transaction, str: string) => Promise<User | undefined>,
    lockStrGetter: (user: User) => string,
  ) {
    const insertedUser = await insertUser()
    const lockStr = lockStrGetter(insertedUser)
    const temporaryName = 'temporary'
    const remainingName = 'remaining'
    let isFirstRenameStarted = false
    let isSecondRenameStarted = false
    function expectRenames(isFirstStarted: boolean, isSecondStarted: boolean) {
      assertEqual(isFirstRenameStarted, isFirstStarted)
      assertEqual(isSecondRenameStarted, isSecondStarted)
    }
    expectRenames(false, false)
    // A delay is needed to control race condition so that test execution is
    // similar every time. Longer delay improves probability while obviously
    // slowing the test down. The delay value is multiplied to achieve desired
    // execution order in the setup phase.
    const delayMs = 50
    const rename1Promise = ctx.db.executeReadWriteTransaction(async (trx) => {
      expectRenames(false, false)
      const lockedUser = await lockFunc(trx, lockStr)
      // Getting lock before either rename is in progress is essential for the
      // the test to be reliable.
      expectRenames(false, false)
      assertDeepEqual(lockedUser, insertedUser)
      // Second rename may or may not have started here.
      return new Promise(function (resolve) {
        setTimeout(function () {
          expectRenames(false, true)
          const promise = userRepository.setUserUsername(
            trx,
            insertedUser.id,
            temporaryName,
          )
          isFirstRenameStarted = true
          resolve(promise)
        }, delayMs * 2)
      })
    })
    const rename2Promise = ctx.db.executeReadWriteTransaction(async (trx2) => {
      return new Promise((resolve) => {
        setTimeout(function () {
          expectRenames(false, false)
          const promise = userRepository.setUserUsername(
            trx2,
            insertedUser.id,
            remainingName,
          )
          isSecondRenameStarted = true
          return resolve(promise)
        }, delayMs)
      })
    })
    await Promise.all([rename2Promise, rename1Promise])
    expectRenames(true, true)

    const foundUser = await userRepository.findUserById(ctx.db, insertedUser.id)
    assertEqual(foundUser?.username, remainingName)
  }

  test('lock user by id', async () => {
    await testLocking(userRepository.lockUserById, (user: User) => user.id)
  })

  test('lock user that does not exist by id', async () => {
    const result = await ctx.db.executeReadWriteTransaction(async (trx) => {
      await userRepository.lockUserById(
        trx,
        '93ef3418-e560-46a2-85ec-eb89927ac605',
      )
    })
    assertEqual(result, undefined)
  })

  test('lock user by username', async () => {
    await testLocking(userRepository.lockUserByUsername, (user: User) => {
      if (user.username === null) {
        throw new Error('username must not be null')
      }
      return user.username
    })
  })

  test('set user username', async () => {
    const insertedUser = await insertUser()
    const username = 'another username'
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      await userRepository.setUserUsername(trx, insertedUser.id, username)
    })
    const foundUser = await userRepository.findUserById(ctx.db, insertedUser.id)
    assertEqual(foundUser?.username, username)
  })

  test('delete user', async () => {
    const insertedUser = await insertUser()
    await ctx.db.executeReadWriteTransaction(async (trx) => {
      await userRepository.deleteUserById(trx, insertedUser.id)
    })
    const foundUser = await userRepository.findUserById(ctx.db, insertedUser.id)
    assertEqual(foundUser, undefined)
  })
})
