import type { UserPasswordHash } from '../../../core/user/sign-in-method'
import type { Transaction } from '../../database'

function defaultToNull(date: Date | undefined): Date | null {
  return date ?? null
}

function defaultToUndefined(date: Date | null): Date | undefined {
  return date ?? undefined
}

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
    passwordHash: method.password_hash,
    hashedAt: defaultToUndefined(method.hashed_at)
  }
}

export async function insertPasswordSignInMethod (
  trx: Transaction,
  method: UserPasswordHash
): Promise<UserPasswordHash> {
  const result = await trx.trx()
    .with('sim', (trx) =>
      trx
        .insertInto('sign_in_method')
        .values({ user_id: method.userId, type: 'password' })
    )
    .insertInto('password_sign_in_method')
    .values({
      user_id: method.userId,
      password_hash: method.passwordHash,
      hashed_at: defaultToNull(method.hashedAt)
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    userId: result.user_id,
    passwordHash: result.password_hash,
    hashedAt: defaultToUndefined(result.hashed_at)
  }
}

export async function updatePassword (
  trx: Transaction,
  userPasswordHash: UserPasswordHash
): Promise<UserPasswordHash> {
  const updatedMethod = await trx.trx()
    .updateTable('password_sign_in_method')
    .set({
      password_hash: userPasswordHash.passwordHash,
      hashed_at: defaultToNull(userPasswordHash.hashedAt)
    })
    .where('user_id', '=', userPasswordHash.userId)
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    userId: updatedMethod.user_id,
    passwordHash: updatedMethod.password_hash,
    hashedAt: defaultToUndefined(updatedMethod.hashed_at)
  }
}

export async function clearOldHashedAt (
  trx: Transaction,
  oldDate: Date
): Promise<void> {
  await trx.trx()
    .updateTable('password_sign_in_method')
    .set({
      hashed_at: null
    })
    .where('hashed_at', '<', oldDate)
    .execute()
}
