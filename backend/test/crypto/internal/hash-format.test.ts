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

  const malformed: Array<[string, string]> = [
    ['empty', ''],
    ['other algorithm', '$argon2id$ln=17,r=8,p=2$+/8B$AAECAw'],
    ['missing parameter', '$scrypt$ln=17,r=8$+/8B$AAECAw'],
    ['leading zero in parameter', '$scrypt$ln=017,r=8,p=2$+/8B$AAECAw'],
    ['padded base64', '$scrypt$ln=17,r=8,p=2$+/8B$AAECAw=='],
    ['base64 with stray trailing bits', '$scrypt$ln=17,r=8,p=2$+/8B$AAECAx'],
    ['url safe base64', '$scrypt$ln=17,r=8,p=2$-_8B$AAECAw'],
    ['legacy salt:key format', `${'ab'.repeat(16)}:${'cd'.repeat(64)}`],
  ]
  for (const [name, value] of malformed) {
    it(`reject ${name}`, () => {
      assertEqual(parseHash(value), undefined)
    })
  }
})
