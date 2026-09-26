import { describe, it } from 'node:test'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import {
  formatHash,
  parseHash,
} from '../../../src/crypto/internal/hash-format.js'

describe('hash format', () => {
  const hash = {
    parameters: { N: 131072, r: 8, p: 2 },
    salt: Buffer.from([0xfb, 0xff, 0x01]),
    key: Buffer.from([0x00, 0x01, 0x02, 0x03]),
  }
  const formatted = '$scrypt$ln=17,r=8,p=2$+/8B$AAECAw'

  it('format parameters, salt and key as unpadded base64', () => {
    assertEqual(formatHash(hash), formatted)
  })

  it('parse formatted hash', () => {
    assertDeepEqual(parseHash(formatted), hash)
  })

  it('parse legacy hash with its fixed parameters and hex text salt', () => {
    const salt = '3571471e876241089e4e29130fd96cf0'
    const key = 'ab'.repeat(64)
    assertDeepEqual(parseHash(`${salt}:${key}`), {
      parameters: { N: 16384, r: 8, p: 1 },
      salt: Buffer.from(salt, 'utf8'),
      key: Buffer.from(key, 'hex'),
    })
  })

  const malformed: Array<[string, string]> = [
    ['empty', ''],
    ['other algorithm', '$argon2id$ln=17,r=8,p=2$+/8B$AAECAw'],
    ['missing parameter', '$scrypt$ln=17,r=8$+/8B$AAECAw'],
    ['leading zero in parameter', '$scrypt$ln=017,r=8,p=2$+/8B$AAECAw'],
    ['padded base64', '$scrypt$ln=17,r=8,p=2$+/8B$AAECAw=='],
    ['base64 with stray trailing bits', '$scrypt$ln=17,r=8,p=2$+/8B$AAECAx'],
    ['url safe base64', '$scrypt$ln=17,r=8,p=2$-_8B$AAECAw'],
    ['legacy with short salt', `3571471e:${'ab'.repeat(64)}`],
    [
      'legacy with short key',
      `3571471e876241089e4e29130fd96cf0:${'ab'.repeat(32)}`,
    ],
    [
      'legacy in upper case',
      `3571471E876241089E4E29130FD96CF0:${'AB'.repeat(64)}`,
    ],
  ]
  for (const [name, value] of malformed) {
    it(`reject ${name}`, () => {
      assertEqual(parseHash(value), undefined)
    })
  }
})
