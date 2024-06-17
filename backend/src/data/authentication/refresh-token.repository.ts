import { type DbRefreshToken } from '../../core/authentication/refresh-token'
import { type Database, type Transaction } from '../database'

export async function insertRefreshToken (
  trx: Transaction,
  userId: string
): Promise<DbRefreshToken> {
  const [refreshToken] = await trx.trx()
    .insertInto('refresh_token')
    .values({
      user_id: userId,
      last_refreshed_at: new Date()
    })
    .returningAll()
    .execute()

  return {
    id: refreshToken.refresh_token_id,
    userId: refreshToken.user_id
  }
}

export async function findRefreshToken (
  db: Database,
  userId: string,
  refreshTokenId: string
): Promise<DbRefreshToken | undefined> {
  const token = await db.getDb()
    .selectFrom('refresh_token as rt')
    .selectAll('rt')
    .innerJoin('user as u', 'rt.user_id', 'u.user_id')
    .where('u.user_id', '=', userId)
    .where('rt.refresh_token_id', '=', refreshTokenId)
    .executeTakeFirst()

  if (token === undefined) {
    return undefined
  }

  return {
    id: token.refresh_token_id,
    userId: token.user_id
  }
}

export async function updateRefreshToken (
  trx: Transaction,
  refreshTokenId: string,
  refreshTime: Date
): Promise<void> {
  await trx.trx()
    .updateTable('refresh_token')
    .set({ last_refreshed_at: refreshTime })
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
