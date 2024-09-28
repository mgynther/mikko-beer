import type {
  CreateAnonymousUserRequest,
  NewUser,
  User
} from '../../core/user/user'
import type { Database, Transaction } from '../../data/database'
import type { UserRow } from './user.table'

export async function createAnonymousUser (
  trx: Transaction,
  user: CreateAnonymousUserRequest
): Promise<User> {
  const insertedUser = await trx.trx()
    .insertInto('user')
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow()
  return toUser(insertedUser)
}

export async function insertUser (
  trx: Transaction,
  user: NewUser
): Promise<User> {
  const insertedUser = await trx.trx()
    .insertInto('user')
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow()
  return toUser(insertedUser)
}

export async function findUserById (
  db: Database,
  id: string
): Promise<User | undefined> {
  const row = await db.getDb()
    .selectFrom('user')
    .where('user_id', '=', id)
    .selectAll('user')
    .executeTakeFirst()

  if (row === undefined) {
    return undefined
  }

  return toUser(row)
}

export async function listUsers (
  db: Database
): Promise<User[]> {
  const rows = await db.getDb()
    .selectFrom('user')
    .selectAll('user')
    .execute()

  return rows.map(toUser)
}

export async function lockUserById (
  trx: Transaction,
  id: string
): Promise<User | undefined> {
  return await lockUser(trx, 'user_id', id)
}

export async function lockUserByUsername (
  trx: Transaction,
  username: string
): Promise<User | undefined> {
  return await lockUser(trx, 'username', username)
}

async function lockUser (
  trx: Transaction,
  column: 'user_id' | 'username',
  value: string
): Promise<User | undefined> {
  const row = await trx.trx()
    .selectFrom('user')
    .where(column, '=', value)
    .selectAll('user')
    .forUpdate()
    .executeTakeFirst()

  if (row === undefined) {
    return undefined
  }

  return toUser(row)
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

function toUser (row: UserRow): User {
  return {
    id: row.user_id,
    username: row.username,
    role: row.role
  }
}
