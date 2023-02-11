import { type Kysely, type Transaction } from 'kysely'
import { type Database } from '../database'
import { type InsertableUserRow, type UserRow } from './user.table'

export async function insertUser (
  db: Kysely<Database>,
  user: InsertableUserRow
): Promise<UserRow> {
  const insertedUser = await db
    .insertInto('user')
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedUser
}

export async function findUserById (
  db: Kysely<Database>,
  id: string
): Promise<UserRow | undefined> {
  const user = await db
    .selectFrom('user')
    .where('user_id', '=', id)
    .selectAll('user')
    .executeTakeFirst()

  return user
}

export async function lockUserById (
  trx: Transaction<Database>,
  id: string
): Promise<UserRow | undefined> {
  return await lockUser(trx, 'user_id', id)
}

export async function lockUserByEmail (
  trx: Transaction<Database>,
  email: string
): Promise<UserRow | undefined> {
  return await lockUser(trx, 'email', email)
}

async function lockUser (
  trx: Transaction<Database>,
  column: 'user_id' | 'email',
  value: string
): Promise<UserRow | undefined> {
  const user = await trx
    .selectFrom('user')
    .where(column, '=', value)
    .selectAll('user')
    .forUpdate()
    .executeTakeFirst()

  return user
}

export async function setUserEmail (
  db: Kysely<Database>,
  id: string,
  email: string
): Promise<void> {
  await db
    .updateTable('user')
    .where('user_id', '=', id)
    .set({ email })
    .execute()
}
