import { type Database, type Transaction } from '../database'
import {
  type RefreshTokenRow,
  type UpdateableRefreshTokenRow
} from './refresh-token.table'

export async function insertRefreshToken (
  trx: Transaction,
  userId: string
): Promise<RefreshTokenRow> {
  const [refreshToken] = await trx.trx()
    .insertInto('refresh_token')
    .values({
      user_id: userId,
      last_refreshed_at: new Date()
    })
    .returningAll()
    .execute()

  return refreshToken
}

export async function findRefreshToken (
  db: Database,
  userId: string,
  refreshTokenId: string
): Promise<RefreshTokenRow | undefined> {
  const token = await db.getDb()
    .selectFrom('refresh_token as rt')
    .selectAll('rt')
    .innerJoin('user as u', 'rt.user_id', 'u.user_id')
    .where('u.user_id', '=', userId)
    .where('rt.refresh_token_id', '=', refreshTokenId)
    .executeTakeFirst()

  return token
}

export async function updateRefreshToken (
  trx: Transaction,
  refreshTokenId: string,
  patch: Pick<UpdateableRefreshTokenRow, 'last_refreshed_at'>
): Promise<void> {
  await trx.trx()
    .updateTable('refresh_token')
    .set(patch)
    .where('refresh_token_id', '=', refreshTokenId)
    .execute()
}

export async function deleteRefreshToken (
  db: Database,
  refreshTokenId: string
): Promise<void> {
  await db.getDb()
    .deleteFrom('refresh_token')
    .where('refresh_token_id', '=', refreshTokenId)
    .execute()
}
