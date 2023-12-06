import { type Database, type Transaction } from '../../data/database'
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

export async function listUsers (
  db: Database
): Promise<UserRow[] | undefined> {
  const user = await db.getDb()
    .selectFrom('user')
    .selectAll('user')
    .execute()

  return user
}

export async function lockUserById (
  trx: Transaction,
  id: string
): Promise<UserRow | undefined> {
  return await lockUser(trx, 'user_id', id)
}

export async function lockUserByUsername (
  trx: Transaction,
  username: string
): Promise<UserRow | undefined> {
  return await lockUser(trx, 'username', username)
}

async function lockUser (
  trx: Transaction,
  column: 'user_id' | 'username',
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

export async function setUserUsername (
  trx: Transaction,
  id: string,
  username: string
): Promise<void> {
  await trx.trx()
    .updateTable('user')
    .where('user_id', '=', id)
    .set({ username })
    .execute()
}

export async function deleteUserById (
  trx: Transaction,
  id: string
): Promise<void> {
  await trx.trx()
    .deleteFrom('user')
    .where('user_id', '=', id)
    .execute()
}
