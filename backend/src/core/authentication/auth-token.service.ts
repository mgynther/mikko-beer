import type {
  AuthTokenConfig,
  AuthToken,
  AuthTokenPayload
} from './auth-token'
import type { Tokens } from './tokens'
import type {
  DbRefreshToken,
  RefreshToken
} from './refresh-token'
import type { User, Role } from '../user/user'
import * as jwt from './jwt'
import { invalidCredentialsTokenError } from '../errors'

export async function createTokens (
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  user: User,
  authTokenConfig: AuthTokenConfig
): Promise<Tokens> {
  const token = await insertRefreshToken(user.id)

  const refresh = jwt.signRefreshToken({
    userId: user.id,
    refreshTokenId: token.id,
    isRefreshToken: true
  }, authTokenConfig.secret)

  const auth = createAuthToken(
    user.role,
    refresh,
    authTokenConfig
  )

  return {
    auth,
    refresh
  }
}

export function verifyAuthToken (
  token: AuthToken,
  authTokenSecret: string
): AuthTokenPayload {
  return jwt.verifyAuthToken(token, authTokenSecret)
}

export async function deleteRefreshToken (
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  userId: string,
  refreshToken: RefreshToken,
  authTokenSecret: string
): Promise<void> {
  const payload = jwt.verifyRefreshToken(refreshToken, authTokenSecret)

  if (payload.userId !== userId) {
    throw invalidCredentialsTokenError
  }

  await deleteRefreshToken(payload.refreshTokenId)
}

function createAuthToken (
  role: Role,
  refreshToken: RefreshToken,
  authTokenConfig: AuthTokenConfig
): AuthToken {
  const { userId, refreshTokenId } = jwt.verifyRefreshToken(
    refreshToken,
    authTokenConfig.secret
  )

  return jwt.signAuthToken(
    { userId, role, refreshTokenId },
    authTokenConfig
  )
}
