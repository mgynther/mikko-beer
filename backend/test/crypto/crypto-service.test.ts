import { describe, it } from 'node:test'
import { assertEqual } from '../assert.js'
import * as assert from 'node:assert/strict'

import {
  encryptSecret,
  needsRehash,
  rejectSecret,
  verifySecret,
} from '../../src/crypto/crypto.service.js'
import { formatHash } from '../../src/crypto/internal/hash-format.js'

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

  it('fail to verify against hash with parameters scrypt refuses', async () => {
    const messages: string[] = []
    const refusedHash =
      '$scrypt$ln=60,r=8,p=1$LSFeH5c5d4Fav49HIqHpiQ$7biLfcxLU9RUv+TVf2fM3s7wY4DJiOfzavESywH5/iFFItGPC9zylXDHCouIE3eJpRbFepfVanqB+inf92yIdA'
    await assert.rejects(
      verifySecret(
        (message) => messages.push(message),
        knownPassword,
        refusedHash,
      ),
      new Error('unknown error'),
    )
    assertEqual(messages.length, 1)
    assertEqual(messages[0].startsWith('crypt failed: '), true)
  })

  it('verify password against malformed hash', async () => {
    assertEqual(await verifySecret(log, knownPassword, 'malformed'), false)
  })

  it('encrypt password with given parameters and verify it', async () => {
    const password = 'password'
    const result = await encryptSecret(log, { N: 1024, r: 8, p: 2 }, password)
    assertEqual(result.startsWith('$scrypt$ln=10,r=8,p=2$'), true)
    assertEqual(await verifySecret(log, password, result), true)
    assertEqual(await verifySecret(log, `${password}1`, result), false)
  })

  it('encrypt same password with different salts', async () => {
    const password = 'password'
    const parameters = { N: 1024, r: 8, p: 1 }
    assertEqual(
      (await encryptSecret(log, parameters, password)) ===
        (await encryptSecret(log, parameters, password)),
      false,
    )
  })
})

describe('needs rehash', () => {
  const log = () => undefined
  const parameters = { N: 1024, r: 8, p: 2 }
  const salt = Buffer.alloc(16, 1)
  const key = Buffer.alloc(64, 2)

  it('no rehash for hash encrypted with the parameters', async () => {
    const hash = await encryptSecret(log, parameters, 'password')
    assertEqual(needsRehash(parameters, hash), false)
  })

  it('no rehash for hash with the parameters and lengths', () => {
    assertEqual(
      needsRehash(parameters, formatHash({ parameters, salt, key })),
      false,
    )
  })

  const outdated: Array<[string, string]> = [
    ['malformed hash', 'malformed'],
    [
      'other N',
      formatHash({ parameters: { ...parameters, N: 2048 }, salt, key }),
    ],
    ['other r', formatHash({ parameters: { ...parameters, r: 4 }, salt, key })],
    ['other p', formatHash({ parameters: { ...parameters, p: 1 }, salt, key })],
    [
      'other salt length',
      formatHash({ parameters, salt: Buffer.alloc(8, 1), key }),
    ],
    [
      'other key length',
      formatHash({ parameters, salt, key: Buffer.alloc(32, 2) }),
    ],
  ]
  for (const [name, hash] of outdated) {
    it(`rehash ${name}`, () => {
      assertEqual(needsRehash(parameters, hash), true)
    })
  }

  it('rehash legacy hash even with its own parameters', () => {
    const legacyHash = `${'ab'.repeat(16)}:${'cd'.repeat(64)}`
    assertEqual(needsRehash({ N: 16384, r: 8, p: 1 }, legacyHash), true)
  })
})

describe('reject secret', () => {
  const log = () => undefined

  it('reject secret by hashing it with the parameters', async () => {
    await rejectSecret(log, { N: 1024, r: 8, p: 2 }, 'password')
  })

  it('fail to reject secret with parameters scrypt refuses', async () => {
    const messages: string[] = []
    await assert.rejects(
      rejectSecret(
        (message) => messages.push(message),
        { N: 1000, r: 8, p: 1 },
        'password',
      ),
      new Error('unknown error'),
    )
    assertEqual(messages.length, 1)
    assertEqual(messages[0].startsWith('crypt failed: '), true)
  })
})
