import { randomBytes, timingSafeEqual } from 'node:crypto'

import { scrypt } from './internal/crypto.js'
import { formatHash, parseHash } from './internal/hash-format.js'
import type { ScryptParameters } from './internal/scrypt-parameters.js'

import type { log } from './log.js'

const parameters: ScryptParameters = { N: 16384, r: 8, p: 1 }
const saltLength = 16
const keyLength = 64

export async function encryptSecret(log: log, secret: string): Promise<string> {
  const salt = randomBytes(saltLength)
  const key = await scrypt(log, secret, salt, keyLength, parameters)
  return formatHash({ parameters, salt, key })
}

export async function verifySecret(
  log: log,
  secret: string,
  hash: string,
): Promise<boolean> {
  const parsed = parseHash(hash)
  if (parsed === undefined) {
    return false
  }
  const key = await scrypt(
    log,
    secret,
    parsed.salt,
    parsed.key.length,
    parsed.parameters,
  )
  return timingSafeEqual(key, parsed.key)
}
