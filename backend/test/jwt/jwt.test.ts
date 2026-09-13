import { describe, it } from 'node:test'
import jsonwebtoken from 'jsonwebtoken'
const { sign } = jsonwebtoken

import { signJwt, verifyJwt } from '../../src/jwt/jwt.service.js'
import { assertDeepEqual, assertEqual, assertTruthy } from '../assert.js'

const secret = 'thisissecret'
const otherSecret = 'thisisanothersecret'

const claims = {
  userId: '9f1d4a2c-1b26-4ca3-9c7f-9a0a5f2e1b4c',
  role: 'admin',
}

describe('jwt service unit tests', () => {
  it('sign and verify a token without expiry', () => {
    const token = signJwt(claims, secret, undefined)
    assertTruthy(token)
    const verificationResult = verifyJwt(token, secret)
    assertEqual(verificationResult.errorCode, undefined)
    assertDeepEqual(
      { ...verificationResult.result, iat: undefined },
      { ...claims, iat: undefined },
    )
  })

  it('sign and verify a token with expiry', () => {
    const token = signJwt(claims, secret, 60)
    const verificationResult = verifyJwt(token, secret)
    assertEqual(verificationResult.errorCode, undefined)
    assertDeepEqual(
      { ...verificationResult.result, iat: undefined, exp: undefined },
      { ...claims, iat: undefined, exp: undefined },
    )
  })

  it('a token without expiry has no expiry claim', () => {
    const token = signJwt(claims, secret, undefined)
    const verificationResult = verifyJwt(token, secret)
    assertEqual(verificationResult.errorCode, undefined)
    assertEqual(verificationResult.result?.exp, undefined)
  })

  it('fail to verify an expired token', () => {
    const token = signJwt(claims, secret, -1)
    const verificationResult = verifyJwt(token, secret)
    assertEqual(verificationResult.errorCode, 'expired-jwt')
    assertEqual(verificationResult.result, undefined)
  })

  it('fail to verify a token signed with another secret', () => {
    const token = signJwt(claims, otherSecret, undefined)
    const verificationResult = verifyJwt(token, secret)
    assertEqual(verificationResult.errorCode, 'invalid-jwt')
    assertEqual(verificationResult.result, undefined)
  })

  it('fail to verify a malformed token', () => {
    const verificationResult = verifyJwt('this is not a token', secret)
    assertEqual(verificationResult.errorCode, 'invalid-jwt')
    assertEqual(verificationResult.result, undefined)
  })

  it('fail to verify a token with a string payload', () => {
    const token = sign('hacking', secret)
    const verificationResult = verifyJwt(token, secret)
    assertEqual(verificationResult.errorCode, 'invalid-jwt')
    assertEqual(verificationResult.result, undefined)
  })
})
