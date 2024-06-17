import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type NewUser, type User } from '../../../src/core/user/user'
import * as userRepository from '../../../src/data/user/user.repository'
import { Role } from '../../../src/core/user/user'
import { Transaction } from '../../../src/data/database'

describe('user tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  const user: NewUser = {
    username: 'user',
    role: Role.admin,
  }

  async function insertUser(): Promise<User> {
    return await ctx.db.executeTransaction(async (trx) => {
      return await userRepository.insertUser(trx, { ...user })
    })
  }

  it('insert user', async () => {
    const insertedUser = await insertUser()
    expect(insertedUser.username).to.equal(user.username)
    expect(insertedUser.role).to.equal(user.role)
  })

  it('find user', async () => {
    const insertedUser = await insertUser()
    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.id
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
    lockFunc: (trx: Transaction, str: string) => Promise<User | undefined>,
    lockStrGetter: (user: User) => string
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
            trx, insertedUser.id, temporaryName
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
            trx2, insertedUser.id, remainingName
          )
          isSecondRenameStarted = true
          return resolve(promise)
        }, delayMs)
      })
    })
    await Promise.all([rename2Promise, rename1Promise])
    expectRenames(true, true)

    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.id
    )
    expect(foundUser?.username).to.eql(remainingName)
  }

  it('lock user by id', async () => {
    await testLocking(
      userRepository.lockUserById,
      (user: User) => user.id
    )
  })

  it('lock user by username', async () => {
    await testLocking(
      userRepository.lockUserByUsername,
      (user: User) => {
      if (user.username === null) {
        throw new Error('username must not be null')
      }
      return user.username
    })
  })

  it('set user username', async () => {
    const insertedUser = await insertUser()
    const username = 'another username'
    await ctx.db.executeTransaction(async (trx) => {
      userRepository.setUserUsername(trx, insertedUser.id, username)
    })
    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.id
    )
    expect(foundUser?.username).to.eql(username)
  })

  it('delete user', async () => {
    const insertedUser = await insertUser()
    await ctx.db.executeTransaction(async (trx) => {
      userRepository.deleteUserById(trx, insertedUser.id)
    })
    const foundUser = await userRepository.findUserById(
      ctx.db, insertedUser.id
    )
    expect(foundUser).to.eql(undefined)
  })
})
