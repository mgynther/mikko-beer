import { type Database, type Transaction } from '../database'
import { type InsertableUserRow, type UserRow } from './user.table'

export async function insertUser (
  trx: Transaction,
  user: InsertableUserRow
): Promise<UserRow> {
  const insertedUser = await trx.trx()
    .insertInto('user')
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedUser
}

export async function findUserById (
  db: Database,
  id: string
): Promise<UserRow | undefined> {
  const user = await db.getDb()
    .selectFrom('user')
    .where('user_id', '=', id)
    .selectAll('user')
    .executeTakeFirst()

  return user
}

export async function lockUserById (
  trx: Transaction,
  id: string
): Promise<UserRow | undefined> {
  return await lockUser(trx, 'user_id', id)
}

export async function lockUserByEmail (
  trx: Transaction,
  email: string
): Promise<UserRow | undefined> {
  return await lockUser(trx, 'email', email)
}

async function lockUser (
  trx: Transaction,
  column: 'user_id' | 'email',
  value: string
): Promise<UserRow | undefined> {
  const user = await trx.trx()
    .selectFrom('user')
    .where(column, '=', value)
    .selectAll('user')
    .forUpdate()
    .executeTakeFirst()

  return user
}

export async function setUserEmail (
  trx: Transaction,
  id: string,
  email: string
): Promise<void> {
  await trx.trx()
    .updateTable('user')
    .where('user_id', '=', id)
    .set({ email })
    .execute()
}
