import type {
  DbRefreshToken
} from '../../../src/core/authentication/refresh-token'
import * as authTokenService from '../../../src/core/authentication/auth-token.service'
import * as authenticationService from '../../../src/core/authentication/authentication.service'
import { Role, type User } from '../../../src/core/user/user'
import { type Tokens } from '../../../src/core/authentication/tokens'
import type {
  AuthTokenPayload,
  AuthToken,
  AuthTokenConfig
} from '../../../src/core/authentication/auth-token'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError,
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError
} from '../../../src/core/errors'
import { expectReject, expectThrow } from '../controller-error-helper'

const authTokenSecret = 'ThisIsSecret'
const authTokenConfig: AuthTokenConfig = {
  expiryDuration: '5m',
  secret: authTokenSecret
}
const refreshTokenId = 'f2224f80-b478-43e2-8cc9-d39cf8079524'

const admin: User = {
  id: 'f4768755-d692-458f-a311-5aaeb81fd4ec',
  role: Role.admin,
  username: 'admin'
}

const otherAdmin: User = {
  id: 'e8d718a3-0a85-41f3-9040-b7aff4470987',
  role: Role.admin,
  username: 'otheradmin'
}

const viewer: User = {
  id: '2a036606-c4cc-46b6-8093-4bf3835fff85',
  role: Role.viewer,
  username: 'viewer'
}

const otherViewer: User = {
  id: 'ca8c2111-db26-472a-bdf5-4c5fa1516425',
  role: Role.viewer,
  username: 'otherviewer'
}

const expiredAuthToken: AuthToken = {
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjcxZWZlMi00MmVmLTQ3MjQtOGU2Ny0xYmIzZTdiYzIxZDMiLCJyb2xlIjoiYWRtaW4iLCJyZWZyZXNoVG9rZW5JZCI6IjkxNGY0MDM3LTZjZWUtNDZlZS04Nzk5LTE2NzNkYWQ2M2Y1NSIsImlhdCI6MTcxOTA3NjI2MiwiZXhwIjoxNzE5MDc2NTYyfQ.FX28XilV4myW0993MdBEnxeIYoDDljG6ZeOUJA5XMtY'
}

async function insertAuthToken(userId: string): Promise<DbRefreshToken> {
  return {
    id: refreshTokenId,
    userId
  }
}

async function findRefreshToken(
  userId: string,
  refreshTokenId: string
): Promise<DbRefreshToken> {
  return {
    id: refreshTokenId,
    userId
  }
}

async function notCalledFindRefreshToken(
): Promise<DbRefreshToken | undefined> {
  throw new Error('must not be called')
}

async function dontFindRefresToken(
): Promise<undefined> {
  return undefined
}

async function createTokens(user: User): Promise<Tokens> {
  return await authTokenService.createTokens(
    insertAuthToken,
    user,
    authTokenConfig
  )
}

async function createAuthTokenPayload(user: User): Promise<AuthTokenPayload> {
  const tokens = await createTokens(user)
  const payload = authenticationService.parseAuthTokenPayload(
    header(tokens.auth),
    authTokenSecret
  )
  return payload
}

function header(authToken: AuthToken): string {
  return `Bearer ${authToken.authToken}`
}

describe('authentication service unit tests', () => {

  it('authenticate admin', async () => {
    const payload = await createAuthTokenPayload(admin)
    authenticationService.authenticateAdmin(payload)
  })

  it('fail to authenticate admin as viewer', async () => {
    const payload = await createAuthTokenPayload(viewer)
    expectThrow(() => {
      authenticationService.authenticateAdmin(payload)
    }, noRightsError)
  })

  it('authenticate viewer', async () => {
    const payload = await createAuthTokenPayload(viewer)
    authenticationService.authenticateViewer(payload)
  })

  it('authenticate viewer as admin', async () => {
    const payload = await createAuthTokenPayload(admin)
    authenticationService.authenticateViewer(payload)
  })

  it('fail to authenticate user without user id', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    expectReject(async () => {
      await authenticationService.authenticateUser(
        '',
        authTokenPayload,
        notCalledFindRefreshToken
      )
    }, noUserIdParameterError)
  })

  it('authenticate self user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authenticationService.authenticateUser(
      admin.id,
      authTokenPayload,
      notCalledFindRefreshToken
    )
  })

  it('authenticate other admin user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authenticationService.authenticateUser(
      otherAdmin.id,
      authTokenPayload,
      notCalledFindRefreshToken
    )
  })

  it('authenticate viewer user as admin', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authenticationService.authenticateUser(
      viewer.id,
      authTokenPayload,
      notCalledFindRefreshToken
    )
  })

  it('authenticate self user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(admin)
    await authenticationService.authenticateUser(
      viewer.id,
      authTokenPayload,
      findRefreshToken
    )
  })

  it('fail to authenticate admin user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    expectReject(async () => {
      await authenticationService.authenticateUser(
        admin.id,
        authTokenPayload,
        notCalledFindRefreshToken
      )
    }, userMismatchError)
  })

  it('fail to authenticate other viewer user as viewer', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    expectReject(async () => {
      await authenticationService.authenticateUser(
        otherViewer.id,
        authTokenPayload,
        notCalledFindRefreshToken
      )
    }, userMismatchError)
  })

  it('fail to authenticate viewer when refresh token not found', async () => {
    const authTokenPayload = await createAuthTokenPayload(viewer)
    expectReject(async () => {
      await authenticationService.authenticateUser(
        viewer.id,
        authTokenPayload,
        dontFindRefresToken
      )
    }, userOrRefreshTokenNotFoundError)
  })

  it('fail to parse auth token with expired auth header', () => {
    expectThrow(() => {
      authenticationService.parseAuthTokenPayload(
        header(expiredAuthToken),
        authTokenSecret
      )
    }, expiredAuthTokenError)
  })

  it('fail to parse auth token without auth header', () => {
    expectThrow(() => {
      authenticationService.parseAuthTokenPayload(
        undefined,
        authTokenSecret
      )
    }, invalidAuthorizationHeaderError)
  })

  it('fail to parse auth token with invalid auth header', () => {
    expectThrow(() => {
      authenticationService.parseAuthTokenPayload(
        'this is invalid auth header',
        authTokenSecret
      )
    }, invalidAuthorizationHeaderError)
  })

  it('fail to parse auth token with invalid auth token', () => {
    expectThrow(() => {
      authenticationService.parseAuthTokenPayload(
        'Bearer abc',
        authTokenSecret
      )
    }, invalidAuthTokenError)
  })
})
