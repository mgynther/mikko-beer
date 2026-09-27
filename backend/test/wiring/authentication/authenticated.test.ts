import { suite, test } from '../../test.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { mockFunction } from '../../mock.js'

import { authenticated } from '../../../src/wiring/authentication/authenticated.js'
import { jwtIf } from '../../../src/wiring/authentication/jwt-helper.js'
import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token.js'
import type { ControllerError } from '../../../src/logic/errors.js'
import {
  expiredAuthTokenError,
  invalidAuthTokenError,
  invalidAuthorizationHeaderError,
} from '../../../src/logic/errors.js'
import type { IdRequest } from '../../../src/web/request.js'
import { expectReject } from '../../logic/controller-error-helper.js'
import { testConfig } from '../test-config.js'

const payload: AuthTokenPayload = {
  userId: 'a4b2c9d1-7e3f-4a5b-9c8d-0e1f2a3b4c5d',
  role: 'viewer',
  refreshTokenId: 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b',
}

function bearer(secret: string, expiryDurationMin: number): string {
  return `Bearer ${jwtIf.sign({ ...payload }, secret, expiryDurationMin)}`
}

function createHandle() {
  return mockFunction<
    [authTokenPayload: AuthTokenPayload, request: IdRequest],
    Promise<string>
  >(async () => 'handled')
}

async function expectRejectBeforeHandle(
  authorization: string | undefined,
  error: ControllerError,
): Promise<void> {
  const handle = createHandle()
  await expectReject(async () => {
    await authenticated(testConfig, handle)({ authorization, id: undefined })
  }, error)
  assertEqual(handle.mock.callCount(), 0)
}

suite('authenticated', () => {
  test('hand the payload of a valid token to the handler', async () => {
    const handle = createHandle()
    const request: IdRequest = {
      authorization: bearer(testConfig.authTokenSecret, 5),
      id: 'd1c2b3a4-9e8f-4a7b-8c6d-5e4f3a2b1c0d',
    }

    const result = await authenticated(testConfig, handle)(request)

    assertEqual(result, 'handled')
    assertDeepEqual(
      handle.mock.calls.map((call) => call.arguments),
      [[payload, request]],
    )
  })

  test('reject a missing authorization before the handler', async () => {
    await expectRejectBeforeHandle(undefined, invalidAuthorizationHeaderError)
  })

  test('reject an authorization that is not a bearer token', async () => {
    await expectRejectBeforeHandle(
      'Basic dXNlcjpwYXNz',
      invalidAuthorizationHeaderError,
    )
  })

  test('reject a token signed with another secret', async () => {
    await expectRejectBeforeHandle(
      bearer('another secret', 5),
      invalidAuthTokenError,
    )
  })

  test('reject an expired token', async () => {
    await expectRejectBeforeHandle(
      bearer(testConfig.authTokenSecret, -1),
      expiredAuthTokenError,
    )
  })
})
