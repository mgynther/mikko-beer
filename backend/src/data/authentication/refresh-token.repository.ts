import type { Kysely, Selectable, SelectQueryBuilder } from 'kysely'

import type { Database, KyselyDatabase, Transaction } from '../database.js'
import type { UserTable } from '../user/user.table.js'
import type { RefreshTokenTable } from './refresh-token.table.js'

export interface DbRefreshToken {
  id: string
  userId: string
}

export async function insertRefreshToken(
  trx: Transaction,
  userId: string,
  date: Date,
): Promise<DbRefreshToken> {
  const [refreshToken] = await trx
    .trx()
    .insertInto('refresh_token')
    .values({
      user_id: userId,
      last_refreshed_at: date,
    })
    .returningAll()
    .execute()

  return {
    id: refreshToken.refresh_token_id,
    userId: refreshToken.user_id,
  }
}

export async function findRefreshToken(
  db: Database,
  userId: string,
  refreshTokenId: string,
): Promise<DbRefreshToken | undefined> {
  const token = await selectRefreshToken(
    db.getDb(),
    userId,
    refreshTokenId,
  ).executeTakeFirst()
  return token === undefined ? undefined : toDbRefreshToken(token)
}

// Locks the refresh token row only. Locking the user row is left to the
// caller, which decides the order the two are locked in.
export async function findRefreshTokenInTransaction(
  trx: Transaction,
  userId: string,
  refreshTokenId: string,
): Promise<DbRefreshToken | undefined> {
  const token = await selectRefreshToken(trx.trx(), userId, refreshTokenId)
    .forShare('rt')
    .executeTakeFirst()
  return token === undefined ? undefined : toDbRefreshToken(token)
}

function selectRefreshToken(
  db: Kysely<KyselyDatabase>,
  userId: string,
  refreshTokenId: string,
): SelectQueryBuilder<
  KyselyDatabase & { rt: RefreshTokenTable; u: UserTable },
  'rt' | 'u',
  Selectable<RefreshTokenTable>
> {
  return db
    .selectFrom('refresh_token as rt')
    .selectAll('rt')
    .innerJoin('user as u', 'rt.user_id', 'u.user_id')
    .where('u.user_id', '=', userId)
    .where('rt.refresh_token_id', '=', refreshTokenId)
}

function toDbRefreshToken(row: Selectable<RefreshTokenTable>): DbRefreshToken {
  return {
    id: row.refresh_token_id,
    userId: row.user_id,
  }
}

export async function deleteRefreshToken(
  trx: Transaction,
  refreshTokenId: string,
): Promise<boolean> {
  const result = await trx
    .trx()
    .deleteFrom('refresh_token')
    .where('refresh_token_id', '=', refreshTokenId)
    .executeTakeFirstOrThrow()
  return result.numDeletedRows > 0n
}
