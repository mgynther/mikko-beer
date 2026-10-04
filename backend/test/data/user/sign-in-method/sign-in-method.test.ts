import {
  suite,
  test,
  before,
  beforeEach,
  after,
  afterEach,
} from '../../../test.js'

import { TestContext } from '../../test-context.js'
import type { Transaction } from '../../../../src/data/database.js'
import type { UserPasswordHash } from '../../../../src/data/user/sign-in-method/sign-in-method.repository.js'
import * as signInMethodRepository from '../../../../src/data/user/sign-in-method/sign-in-method.repository.js'
import type { User } from '../../../../src/data/user/user.repository.js'
import * as userRepository from '../../../../src/data/user/user.repository.js'
import { assertDeepEqual, assertEqual } from '../../../assert.js'

// Hashes as the crypto layer writes them; the repository stores them as is.
const passwordHash = '$scrypt$ln=10,r=8,p=1$c2FsdHNhbHRzYWx0$a2V5a2V5a2V5a2V5'
const otherPasswordHash =
  '$scrypt$ln=14,r=8,p=1$b3RoZXJzYWx0b3RoZXI$b3RoZXJrZXlvdGhlcmtleQ'

suite('sign-in-method tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('return undefined sign-in-method when it does not exist', async () => {
    const signInMethod = await ctx.db.executeReadWriteTransaction(
      async (trx) => {
        return await signInMethodRepository.findPasswordSignInMethod(
          trx,
          '5b99be2f-5c0f-4fcf-bb72-e3af3110b0e1',
        )
      },
    )
    assertEqual(signInMethod, undefined)
  })

  async function insertUserWithPassword(username = 'kalle'): Promise<User> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) => {
        const user = await userRepository.insertUser(trx, {
          username,
          role: 'viewer',
        })
        await signInMethodRepository.insertPasswordSignInMethod(trx, {
          userId: user.id,
          passwordHash,
        })
        return user
      },
    )
  }

  async function findSignInMethod(
    userId: string,
  ): Promise<UserPasswordHash | undefined> {
    return await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await signInMethodRepository.findPasswordSignInMethod(trx, userId),
    )
  }

  test('insert and find a password sign-in-method', async () => {
    const user = await insertUserWithPassword()
    assertDeepEqual(await findSignInMethod(user.id), {
      userId: user.id,
      passwordHash,
    })
  })

  test('find no sign-in-method for a user without a password', async () => {
    await insertUserWithPassword()
    const userWithoutPassword = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await userRepository.insertUser(trx, {
          username: 'ville',
          role: 'viewer',
        }),
    )
    assertEqual(await findSignInMethod(userWithoutPassword.id), undefined)
  })

  test('update password', async () => {
    const user = await insertUserWithPassword()
    const updated = await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await signInMethodRepository.updatePassword(trx, {
          userId: user.id,
          passwordHash: otherPasswordHash,
        }),
    )
    const expected = { userId: user.id, passwordHash: otherPasswordHash }
    assertDeepEqual(updated, expected)
    assertDeepEqual(await findSignInMethod(user.id), expected)
  })

  test('update the password of the given user only', async () => {
    const user = await insertUserWithPassword('kalle')
    const otherUser = await insertUserWithPassword('ville')
    await ctx.db.executeReadWriteTransaction(
      async (trx: Transaction) =>
        await signInMethodRepository.updatePassword(trx, {
          userId: user.id,
          passwordHash: otherPasswordHash,
        }),
    )
    assertDeepEqual(await findSignInMethod(otherUser.id), {
      userId: otherUser.id,
      passwordHash,
    })
  })

  test('delete the sign-in-method with its user', async () => {
    const user = await insertUserWithPassword()
    await ctx.db.executeReadWriteTransaction(async (trx: Transaction) => {
      await userRepository.deleteUserById(trx, user.id)
    })
    assertEqual(await findSignInMethod(user.id), undefined)
  })
})
