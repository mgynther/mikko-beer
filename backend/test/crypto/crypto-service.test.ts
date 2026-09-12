import { describe, it } from 'node:test'
import { assertEqual, assertGreaterThan } from '../assert.js'

import { encryptSecret, verifySecret } from '../../src/crypto/crypto.service.js'

describe('encrypt and verify secret', () => {
  const log = () => undefined
  const knownPassword = 'password'
  const knownHash =
    '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'

  it('verify password against known hash', async () => {
    assertEqual(await verifySecret(log, knownPassword, knownHash), true)
  })

  it('verify wrong password against known hash', async () => {
    assertEqual(await verifySecret(log, `${knownPassword}1`, knownHash), false)
  })

  it('encrypt password and verify password', async () => {
    const password = 'password'
    const result = await encryptSecret(log, password)
    // Sanity check format without being specific.
    assertGreaterThan(result.length, 30)
    const [salt, hashedPassword] = result.split(':')
    assertGreaterThan(salt.length, 10)
    assertGreaterThan(hashedPassword.length, 20)
    // There's no trivial way ensure hash is correct without using the same
    // implementation as in the tested code.
    assertEqual(await verifySecret(log, password, result), true)
    // While ensuring correctness is hard, it's trivial to ensure wrong
    // password fails.
    assertEqual(await verifySecret(log, `${password}1`, result), false)
  })
})
