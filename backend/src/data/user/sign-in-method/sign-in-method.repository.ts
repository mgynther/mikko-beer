import { type UserPasswordHash } from '../../../core/user/sign-in-method'
import { type Transaction } from '../../database'
import {
  type PasswordSignInMethodRow
} from './password-sign-in-method.table'

export async function findPasswordSignInMethod (
  trx: Transaction,
  userId: string
): Promise<UserPasswordHash | undefined> {
  const method = await trx.trx()
    .selectFrom('sign_in_method as sim')
    .innerJoin('password_sign_in_method as psim', 'psim.user_id', 'sim.user_id')
    .selectAll('psim')
    .where('sim.type', '=', 'password')
    .where('sim.user_id', '=', userId)
    .executeTakeFirst()

  if (method === undefined) {
    return undefined
  }

  return {
    userId: method.user_id,
    passwordHash: method.password_hash
  }
}

export async function insertPasswordSignInMethod (
  trx: Transaction,
  method: UserPasswordHash
): Promise<UserPasswordHash> {
  await trx.trx()
    .with('sim', (trx) =>
      trx
        .insertInto('sign_in_method')
        .values({ user_id: method.userId, type: 'password' })
    )
    .insertInto('password_sign_in_method')
    .values({
      user_id: method.userId,
      password_hash: method.passwordHash
    })
    .execute()

  return method
}

export async function updatePassword (
  trx: Transaction,
  userPasswordHash: UserPasswordHash
): Promise<PasswordSignInMethodRow> {
  const updatedMethod = await trx.trx()
    .updateTable('password_sign_in_method')
    .set({
      password_hash: userPasswordHash.passwordHash
    })
    .where('user_id', '=', userPasswordHash.userId)
    .returningAll()
    .executeTakeFirstOrThrow()

  return updatedMethod
}
