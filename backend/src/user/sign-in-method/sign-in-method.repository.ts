import { type Transaction } from '../../database'
import {
  type InsertablePasswordSignInMethodRow,
  type PasswordSignInMethodRow
} from './password-sign-in-method.table'

export async function findPasswordSignInMethod (
  trx: Transaction,
  userId: string
): Promise<PasswordSignInMethodRow | undefined> {
  const method = await trx.trx()
    .selectFrom('sign_in_method as sim')
    .innerJoin('password_sign_in_method as psim', 'psim.user_id', 'sim.user_id')
    .selectAll('psim')
    .where('sim.type', '=', 'password')
    .where('sim.user_id', '=', userId)
    .executeTakeFirst()

  return method
}

export async function insertPasswordSignInMethod (
  trx: Transaction,
  method: InsertablePasswordSignInMethodRow
): Promise<PasswordSignInMethodRow> {
  await trx.trx()
    .with('sim', (trx) =>
      trx
        .insertInto('sign_in_method')
        .values({ user_id: method.user_id, type: 'password' })
    )
    .insertInto('password_sign_in_method')
    .values(method)
    .execute()

  return method
}
