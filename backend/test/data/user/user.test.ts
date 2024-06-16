import { expect } from 'chai'

import { TestContext } from '../test-context'
import * as userRepository from '../../../src/data/user/user.repository'
import { type UserRow } from '../../../src/data/user/user.table'
import { Role } from '../../../src/core/user/user'
import { Transaction } from '../../../src/data/database'

describe('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  const user: UserRow = {
    user_id: '35370921-5d47-4274-a5cc-9fe0246d74e5',
    username: 'user',
    role: Role.admin,
    created_at: new Date()
  }

  async function insertUser(): Promise<UserRow> {
    return await ctx.db.executeTransaction(async (trx) => {
      return await userRepository.insertUser(trx, { ...user })
    })
  }

  it('insert user', async () => {
    const insertedUser = await insertUser()
    expect(insertedUser.user_id).to.equal(user.user_id)
    expect(insertedUser.username).to.equal(user.username)
    expect(insertedUser.role).to.equal(user.role)
  })

  it('find user', async () => {
    const insertedUser = await insertUser()
    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.user_id
    )
    expect(foundUser).to.eql(insertedUser)
  })

  it('do not find user that does not exist', async () => {
    const userId = '35370921-5d47-4274-a5cc-9fe0246d74e5'
    const foundUser = await userRepository.findUserById(ctx.db, userId)
    expect(foundUser).to.eql(undefined)
  })

  it('list users', async () => {
    const insertedUser = await insertUser()
    const users = await userRepository.listUsers(ctx.db)
    expect(users).to.eql([insertedUser])
  })

  it('do not list users when there are none', async () => {
    const users = await userRepository.listUsers(ctx.db)
    expect(users).to.eql([])
  })

  async function testLocking(
    lockFunc: (trx: Transaction, str: string) => Promise<UserRow | undefined>,
    lockStrGetter: (user: UserRow) => string
  ) {
    const insertedUser = await insertUser()
    const lockStr = lockStrGetter(insertedUser)
    const temporaryName = 'temporary'
    const remainingName = 'remaining'
    let isFirstRenameStarted = false
    let isSecondRenameStarted = false
    function expectRenames(isFirstStarted: boolean, isSecondStarted: boolean) {
      expect(isFirstRenameStarted).to.equal(isFirstStarted)
      expect(isSecondRenameStarted).to.equal(isSecondStarted)
    }
    expectRenames(false, false)
    // A delay is needed to control race condition so that test execution is
    // similar every time. Longer delay should improve probability while
    // obviously slowing the test down. The delay value is multiplied to
    // achieve desired execution order in the setup phase.
    const delayMs = 50
    const rename1Promise = ctx.db.executeTransaction(async (trx) => {
      expectRenames(false, false)
      const lockedUser = await lockFunc(trx, lockStr)
      // Getting lock before either rename is in progress is essential for the
      // the test to be reliable.
      expectRenames(false, false)
      expect(lockedUser).to.eql(insertedUser)
      // Second rename may or may not have started here.
      return new Promise(function(resolve) {
        setTimeout(function() {
          expectRenames(false, true)
          const promise = userRepository.setUserUsername(
            trx, insertedUser.user_id, temporaryName
          )
          isFirstRenameStarted = true
          resolve(promise)
        }, delayMs * 2);
      });
    })
    const rename2Promise = ctx.db.executeTransaction(async (trx2) => {
      return new Promise((resolve) => {
        setTimeout(function() {
          expectRenames(false, false)
          const promise = userRepository.setUserUsername(
            trx2, insertedUser.user_id, remainingName
          )
          isSecondRenameStarted = true
          return resolve(promise)
        }, delayMs)
      })
    })
    await Promise.all([rename2Promise, rename1Promise])
    expectRenames(true, true)

    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.user_id
    )
    expect(foundUser?.username).to.eql(remainingName)
  }

  it('lock user by id', async () => {
    await testLocking(
      userRepository.lockUserById,
      (userRow: UserRow) => userRow.user_id
    )
  })

  it('lock user by username', async () => {
    await testLocking(
      userRepository.lockUserByUsername,
      (userRow: UserRow) => {
      if (userRow.username === null) {
        throw new Error('username must not be null')
      }
      return userRow.username
    })
  })

  it('set user username', async () => {
    const insertedUser = await insertUser()
    const username = 'another username'
    await ctx.db.executeTransaction(async (trx) => {
      userRepository.setUserUsername(trx, insertedUser.user_id, username)
    })
    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.user_id
    )
    expect(foundUser?.username).to.eql(username)
  })

  it('delete user', async () => {
    const insertedUser = await insertUser()
    await ctx.db.executeTransaction(async (trx) => {
      userRepository.deleteUserById(trx, insertedUser.user_id)
    })
    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.user_id
    )
    expect(foundUser).to.eql(undefined)
  })
})
