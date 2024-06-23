import { expect } from 'chai'
import { type DbRefreshToken } from '../../../src/core/authentication/refresh-token'
import * as authTokenService from '../../../src/core/authentication/auth-token.service'
import * as authenticationService from '../../../src/core/authentication/authentication.service'
import { Role, type User } from '../../../src/core/user/user'
import { type Tokens } from '../../../src/core/authentication/tokens'
import {
  type AuthToken,
  type AuthTokenConfig
} from '../../../src/core/authentication/auth-token'
import {
    expiredAuthTokenError,
    invalidAuthTokenError,
  invalidAuthorizationHeaderError,
  noRightsError,
  noUserIdParameterError,
  userMismatchError,
  userOrRefreshTokenNotFoundError
} from '../../../src/core/authentication/authentication.service'

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
  expect('should not be called').to.equal(true)
  return undefined
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

function header(authToken: AuthToken): string {
  return `Bearer ${authToken.authToken}`
}

describe('authentication service unit tests', () => {

  function unreachable() {
    expect('should not reach this line').to.equal(true)
  }

  it('authenticate admin', async () => {
    const tokens = await createTokens(admin)
    authenticationService.authenticateAdmin(
      header(tokens.auth),
      authTokenSecret
    )
  })

  it('fail to authenticate admin as viewer', async () => {
    const tokens = await createTokens(viewer)
    expect(() => {
      authenticationService.authenticateAdmin(
        header(tokens.auth),
        authTokenSecret
      )
    }).to.throw(noRightsError)
  })

  it('fail to authenticate admin without auth header', () => {
    expect(() => {
      authenticationService.authenticateAdmin(
        undefined,
        authTokenSecret
      )
    }).to.throw(invalidAuthorizationHeaderError)
  })

  it('fail to authenticate admin with invalid auth header', () => {
    expect(() => {
      authenticationService.authenticateAdmin(
        'invalid header',
        authTokenSecret
      )
    }).to.throw(invalidAuthorizationHeaderError)
  })

  it('fail to authenticate admin with invalid auth token', () => {
    expect(() => {
      authenticationService.authenticateAdmin(
        'Bearer abcd',
        authTokenSecret
      )
    }).to.throw(invalidAuthTokenError)
  })

  it('fail to authenticate admin with expired auth token', () => {
    expect(() => {
      authenticationService.authenticateAdmin(
        header(expiredAuthToken),
        authTokenSecret
      )
    }).to.throw(expiredAuthTokenError)
  })

  it('authenticate viewer', async () => {
    const tokens = await createTokens(viewer)
    authenticationService.authenticateViewer(
      header(tokens.auth),
      authTokenSecret
    )
  })

  it('authenticate viewer as admin', async () => {
    const tokens = await createTokens(admin)
    authenticationService.authenticateViewer(
      header(tokens.auth),
      authTokenSecret
    )
  })

  it('fail to authenticate viewer without auth header', () => {
    expect(() => {
      authenticationService.authenticateViewer(
        undefined,
        authTokenSecret
      )
    }).to.throw(invalidAuthorizationHeaderError)
  })

  it('fail to authenticate viewer with invalid auth header', () => {
    expect(() => {
      authenticationService.authenticateViewer(
        'invalid header',
        authTokenSecret
      )
    }).to.throw(invalidAuthorizationHeaderError)
  })

  it('fail to authenticate viewer with invalid auth token', () => {
    expect(() => {
      authenticationService.authenticateViewer(
        'Bearer 12345',
        authTokenSecret
      )
    }).to.throw(invalidAuthTokenError)
  })

  it('fail to authenticate viewer with expired auth token', () => {
    expect(() => {
      authenticationService.authenticateViewer(
        header(expiredAuthToken),
        authTokenSecret
      )
    }).to.throw(expiredAuthTokenError)
  })

  it('fail to authenticate user without user id', async () => {
    const tokens = await createTokens(admin)
    try {
      await authenticationService.authenticateUser(
        undefined,
        header(tokens.auth),
        authTokenSecret,
        notCalledFindRefreshToken
      )
      unreachable()
    } catch (e) {
      expect(e).to.equal(noUserIdParameterError)
    }
  })

  it('fail to authenticate user without auth header', async () => {
    try {
      await authenticationService.authenticateUser(
        admin.id,
        undefined,
        authTokenSecret,
        notCalledFindRefreshToken
      )
      unreachable()
    } catch (e) {
      expect(e).to.equal(invalidAuthorizationHeaderError)
    }
  })

  it('fail to authenticate user with invalid auth header', async () => {
    try {
      await authenticationService.authenticateUser(
        admin.id,
        'this is invalid auth header',
        authTokenSecret,
        notCalledFindRefreshToken
      )
      unreachable()
    } catch (e) {
      expect(e).to.equal(invalidAuthorizationHeaderError)
    }
  })

  it('fail to authenticate user with invalid auth token', async () => {
    try {
      await authenticationService.authenticateUser(
        admin.id,
        'Bearer abc',
        authTokenSecret,
        notCalledFindRefreshToken
      )
      unreachable()
    } catch (e) {
      expect(e).to.equal(invalidAuthTokenError)
    }
  })

  it('fail to authenticate user with expired auth header', async () => {
    try {
      await authenticationService.authenticateUser(
        admin.id,
        header(expiredAuthToken),
        authTokenSecret,
        notCalledFindRefreshToken
      )
      unreachable()
    } catch (e) {
      expect(e).to.equal(expiredAuthTokenError)
    }
  })

  it('authenticate self user as admin', async () => {
    const tokens = await createTokens(admin)
    await authenticationService.authenticateUser(
      admin.id,
      header(tokens.auth),
      authTokenSecret,
      notCalledFindRefreshToken
    )
  })

  it('authenticate other admin user as admin', async () => {
    const tokens = await createTokens(admin)
    await authenticationService.authenticateUser(
      otherAdmin.id,
      header(tokens.auth),
      authTokenSecret,
      notCalledFindRefreshToken
    )
  })

  it('authenticate viewer user as admin', async () => {
    const tokens = await createTokens(admin)
    await authenticationService.authenticateUser(
      viewer.id,
      header(tokens.auth),
      authTokenSecret,
      notCalledFindRefreshToken
    )
  })

  it('authenticate self user as viewer', async () => {
    const tokens = await createTokens(viewer)
    await authenticationService.authenticateUser(
      viewer.id,
      header(tokens.auth),
      authTokenSecret,
      findRefreshToken
    )
  })

  it('fail to authenticate admin user as viewer', async () => {
    const tokens = await createTokens(viewer)
    try {
      await authenticationService.authenticateUser(
        admin.id,
        header(tokens.auth),
        authTokenSecret,
        notCalledFindRefreshToken
      )
    } catch (e) {
      expect(e).to.equal(userMismatchError)
    }
  })

  it('fail to authenticate other viewer user as viewer', async () => {
    const tokens = await createTokens(viewer)
    try {
      await authenticationService.authenticateUser(
        otherViewer.id,
        header(tokens.auth),
        authTokenSecret,
        notCalledFindRefreshToken
      )
    } catch (e) {
      expect(e).to.equal(userMismatchError)
    }
  })

  it('fail to authenticate viewer when refresh token not found', async () => {
    const tokens = await createTokens(viewer)
    try {
      await authenticationService.authenticateUser(
        viewer.id,
        header(tokens.auth),
        authTokenSecret,
        dontFindRefresToken
      )
    } catch (e) {
      expect(e).to.equal(userOrRefreshTokenNotFoundError)
    }
  })
})
