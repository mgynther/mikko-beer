import * as refreshTokenRepository from '../../data/authentication/refresh-token.repository.js'
import type { Database, Transaction } from '../../data/database.js'
import type { DbRefreshToken } from '../../logic/auth/refresh-token.js'

export function createFindRefreshToken(db: Database) {
  return async (
    userId: string,
    refreshTokenId: string,
  ): Promise<DbRefreshToken | undefined> =>
    await refreshTokenRepository.findRefreshToken(db, userId, refreshTokenId)
}

export function createFindRefreshTokenInTransaction(
  trx: Transaction,
): (
  userId: string,
  refreshTokenId: string,
) => Promise<DbRefreshToken | undefined> {
  return async (
    userId: string,
    refreshTokenId: string,
  ): Promise<DbRefreshToken | undefined> =>
    await refreshTokenRepository.findRefreshTokenInTransaction(
      trx,
      userId,
      refreshTokenId,
    )
}
