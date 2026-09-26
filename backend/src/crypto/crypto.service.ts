import { randomBytes, timingSafeEqual } from 'node:crypto'

import { scrypt } from './internal/crypto.js'
import { formatHash, parseHash } from './internal/hash-format.js'
import type { ScryptParameters } from './scrypt-parameters.js'

import type { log } from './log.js'

const saltLength = 16
const keyLength = 64

export async function encryptSecret(
  log: log,
  parameters: ScryptParameters,
  secret: string,
): Promise<string> {
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
    log('stored hash is malformed')
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

// The work of verifying a secret against a hash with the parameters, for
// when there is no hash, so that a missing one does not answer sooner.
export async function rejectSecret(
  log: log,
  parameters: ScryptParameters,
  secret: string,
): Promise<void> {
  const salt = randomBytes(saltLength)
  await scrypt(log, secret, salt, keyLength, parameters)
}

export function needsRehash(
  parameters: ScryptParameters,
  hash: string,
): boolean {
  const parsed = parseHash(hash)
  if (parsed === undefined) {
    return true
  }
  return (
    parsed.parameters.N !== parameters.N ||
    parsed.parameters.r !== parameters.r ||
    parsed.parameters.p !== parameters.p ||
    parsed.salt.length !== saltLength ||
    parsed.key.length !== keyLength
  )
}
