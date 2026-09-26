import type { Transaction } from '../../database'

export interface UserPasswordHash {
  userId: string
  passwordHash: string
}

export async function findPasswordSignInMethod(
  trx: Transaction,
  userId: string,
): Promise<UserPasswordHash | undefined> {
  const method = await trx
    .trx()
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
  }
}

export async function insertPasswordSignInMethod(
  trx: Transaction,
  method: UserPasswordHash,
): Promise<UserPasswordHash> {
  const result = await trx
    .trx()
    .with('sim', (trx) =>
      trx
        .insertInto('sign_in_method')
        .values({ user_id: method.userId, type: 'password' }),
    )
    .insertInto('password_sign_in_method')
    .values({
      user_id: method.userId,
      password_hash: method.passwordHash,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    userId: result.user_id,
    passwordHash: result.password_hash,
  }
}

export async function updatePassword(
  trx: Transaction,
  userPasswordHash: UserPasswordHash,
): Promise<UserPasswordHash> {
  const updatedMethod = await trx
    .trx()
    .updateTable('password_sign_in_method')
    .set({
      password_hash: userPasswordHash.passwordHash,
    })
    .where('user_id', '=', userPasswordHash.userId)
    .returningAll()
    .executeTakeFirstOrThrow()

  return {
    userId: updatedMethod.user_id,
    passwordHash: updatedMethod.password_hash,
  }
}
