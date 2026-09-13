import type {
  AuthTokenConfig,
  AuthToken,
  AuthTokenPayload,
  JwtIf,
} from '../../auth/auth-token.js'
import type { Tokens } from '../../auth/tokens'
import type { DbRefreshToken, RefreshToken } from '../../auth/refresh-token.js'
import type { User, Role } from '../../user/user.js'
import * as jwt from './jwt.js'
import { invalidCredentialsTokenError } from '../../errors.js'
import type { RefreshTokenPayload } from './jwt.js'

export async function createTokens(
  jwtIf: JwtIf,
  insertRefreshToken: (userId: string) => Promise<DbRefreshToken>,
  user: User,
  authTokenConfig: AuthTokenConfig,
): Promise<Tokens> {
  const token = await insertRefreshToken(user.id)

  const refresh = jwt.signRefreshToken(
    jwtIf,
    {
      userId: user.id,
      refreshTokenId: token.id,
      isRefreshToken: true,
    },
    authTokenConfig.secret,
  )

  const auth = createAuthToken(jwtIf, user.role, refresh, authTokenConfig)

  return {
    auth,
    refresh,
  }
}

export function verifyAuthToken(
  jwtIf: JwtIf,
  token: AuthToken,
  authTokenSecret: string,
): AuthTokenPayload {
  return jwt.verifyAuthToken(jwtIf, token, authTokenSecret)
}

export async function deleteRefreshToken(
  jwtIf: JwtIf,
  deleteRefreshToken: (refreshTokenId: string) => Promise<void>,
  userId: string,
  refreshToken: RefreshToken,
  authTokenSecret: string,
): Promise<void> {
  const payload: RefreshTokenPayload = parseRefreshToken(
    jwtIf,
    refreshToken,
    authTokenSecret,
  )
  if (payload.userId !== userId) {
    throw invalidCredentialsTokenError
  }

  await deleteRefreshToken(payload.refreshTokenId)
}

function parseRefreshToken(
  jwtIf: JwtIf,
  refreshToken: RefreshToken,
  authTokenSecret: string,
): RefreshTokenPayload {
  try {
    return jwt.verifyRefreshToken(jwtIf, refreshToken, authTokenSecret)
  } catch (_) {
    throw invalidCredentialsTokenError
  }
}

function createAuthToken(
  jwtIf: JwtIf,
  role: Role,
  refreshToken: RefreshToken,
  authTokenConfig: AuthTokenConfig,
): AuthToken {
  const { userId, refreshTokenId } = jwt.verifyRefreshToken(
    jwtIf,
    refreshToken,
    authTokenConfig.secret,
  )

  return jwt.signAuthToken(
    jwtIf,
    { userId, role, refreshTokenId },
    authTokenConfig,
  )
}
