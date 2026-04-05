import { describe, it } from 'node:test'

import type { AuthTokenPayload } from '../../../../src/core/auth/auth-token.js'
import { parseAuthTokenPayload, parseRefreshTokenPayload } from '../../../../src/core/internal/auth/jwt-parser.js'
import { InvalidAuthTokenError } from '../../../../src/core/auth/auth-token.js'
import { assertDeepEqual, assertThrows } from '../../../assert.js'
import type { RefreshTokenPayload } from '../../../../src/core/internal/auth/jwt.js'

describe('jwt parser auth token unit tests', () => {
  it('parse valid ', async () => {
    const payload: AuthTokenPayload = {
      userId: '795cfb77-9db9-46f5-9b8e-9188198dd2dc',
      role: 'admin',
      refreshTokenId: '5d48a37f-78fd-4352-ba91-162503800c8a'
    }
    assertDeepEqual(parseAuthTokenPayload(payload), payload)
  })

  interface InvalidAuthTokenPayloadTest {
    name: string
    payload: unknown
  }

  const invalidAuthTokenPayloadTests: InvalidAuthTokenPayloadTest[] = [
    {
      name: 'invalid userId',
      payload: {
        userId: 123,
        role: 'admin',
        refreshTokenId: '4c4c2941-281a-4628-b185-c62a4223e4df'
      }
    },
    {
      name: 'invalid role',
      payload: {
        userId: 'ce9afb5f-ae1f-42a5-97e8-0d639cd62266',
        role: 123,
        refreshTokenId: 'fd9facd8-ed52-4fc4-b996-4d5e74fee687'
      }
    },
    {
      name: 'invalid role value',
      payload: {
        userId: 'ce9afb5f-ae1f-42a5-97e8-0d639cd62266',
        role: 'manager',
        refreshTokenId: 'a1abacd9-1036-4abd-9fb8-72993de6a0ba'
      }
    },
    {
      name: 'invalid refreshTokenId',
      payload: {
        userId: 'ce9afb5f-ae1f-42a5-97e8-0d639cd62266',
        role: 'viewer',
        refreshTokenId: 12
      }
    }
  ]

  invalidAuthTokenPayloadTests.forEach(testCase =>
    it(`fail to parse ${testCase.name}`, async () => {
      assertThrows(
        () => parseAuthTokenPayload(testCase.payload),
        new InvalidAuthTokenError(), InvalidAuthTokenError
      )
    })
  )
})

describe('jwt parser refresh token unit tests', () => {
  it('parse valid ', async () => {
    const payload: RefreshTokenPayload = {
      userId: 'aa8ffab8-8cc3-4598-ae32-4e80888e3faf',
      refreshTokenId: 'ab02c737-a4de-4ac0-8f2f-d3bb2814a7c1',
      isRefreshToken: true
    }
    assertDeepEqual(parseRefreshTokenPayload(payload), payload)
  })

  interface InvalidRefreshTokenPayloadTest {
    name: string
    payload: unknown
  }

  const invalidRefreshTokenPayloadTests: InvalidRefreshTokenPayloadTest[] = [
    {
      name: 'invalid userId',
      payload: {
        userId: 123,
        refreshTokenId: '4c4c2941-281a-4628-b185-c62a4223e4df',
        isRefreshToken: true
      }
    },
    {
      name: 'invalid refreshTokenId',
      payload: {
        userId: '980e0cb2-d230-4327-b844-b3b0268b47df',
        refreshTokenId: 12,
        isRefreshToken: true
      }
    },
    {
      name: 'invalid isRefreshToken',
      payload: {
        userId: '79709907-370f-4105-b953-af63f39a62d8',
        refreshTokenId: 12,
        isRefreshToken: false
      }
    }
  ]

  invalidRefreshTokenPayloadTests.forEach(testCase =>
    it(`fail to parse ${testCase.name}`, async () => {
      assertThrows(
        () => parseRefreshTokenPayload(testCase.payload),
        new InvalidAuthTokenError(), InvalidAuthTokenError
      )
    })
  )
})
