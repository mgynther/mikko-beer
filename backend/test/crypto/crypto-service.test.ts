import { describe, it } from 'node:test'
import { assertEqual } from '../assert.js'

import { encryptSecret, verifySecret } from '../../src/crypto/crypto.service.js'

describe('encrypt and verify secret', () => {
  const log = () => undefined
  const knownPassword = 'password'
  // The known hashes are computed with node:crypto directly rather than with
  // the tested code, so they pin the stored formats.
  const knownHash =
    '$scrypt$ln=14,r=8,p=1$LSFeH5c5d4Fav49HIqHpiQ$7biLfcxLU9RUv+TVf2fM3s7wY4DJiOfzavESywH5/iFFItGPC9zylXDHCouIE3eJpRbFepfVanqB+inf92yIdA'
  const knownLegacyHash =
    '3571471e876241089e4e29130fd96cf0:6b26a82522532fca44ba7fef2f6b6f5d930fb2e2179f7cdcd682470d15a4cc4296b7f77c59bf317fa7281900626cf7b4499948d9d0f4718ae1170d4a63e35f36'
  // Needs 64 MiB, twice what Node allows by default.
  const knownHighMemoryHash =
    '$scrypt$ln=16,r=8,p=1$UuZh6Sxk0UCYyOj9IgAF1A$KxiteKvPQ0ZvZWtbzNfH+jITSUSfq9H1Hu1jn5Ks7+dLXqkyeuYKCygfyHaeucgg897kBNm7LwCSR2V+8lFNgw'

  it('verify password against known hash', async () => {
    assertEqual(await verifySecret(log, knownPassword, knownHash), true)
  })

  it('verify wrong password against known hash', async () => {
    assertEqual(await verifySecret(log, `${knownPassword}1`, knownHash), false)
  })

  it('verify password against known legacy hash', async () => {
    assertEqual(await verifySecret(log, knownPassword, knownLegacyHash), true)
  })

  it('verify wrong password against known legacy hash', async () => {
    assertEqual(
      await verifySecret(log, `${knownPassword}1`, knownLegacyHash),
      false,
    )
  })

  it('verify password against hash needing more than default memory', async () => {
    assertEqual(
      await verifySecret(log, knownPassword, knownHighMemoryHash),
      true,
    )
  })

  it('verify password against malformed hash', async () => {
    assertEqual(await verifySecret(log, knownPassword, 'malformed'), false)
  })

  it('encrypt password with current parameters and verify it', async () => {
    const password = 'password'
    const result = await encryptSecret(log, password)
    assertEqual(result.startsWith('$scrypt$ln=14,r=8,p=1$'), true)
    assertEqual(await verifySecret(log, password, result), true)
    assertEqual(await verifySecret(log, `${password}1`, result), false)
  })

  it('encrypt same password with different salts', async () => {
    const password = 'password'
    assertEqual(
      (await encryptSecret(log, password)) ===
        (await encryptSecret(log, password)),
      false,
    )
  })
})
