import type { ScryptParameters } from '../scrypt-parameters.js'

export interface ScryptHash {
  parameters: ScryptParameters
  salt: Buffer
  key: Buffer
}

// The PHC string format: ln is the base 2 logarithm of N, and the salt and
// key are base64 without padding.
const phcPattern =
  /^\$scrypt\$ln=(\d+),r=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/

// The first format had no parameters and passed the hex salt to scrypt as a
// string, so the salt is the bytes of its hex text. Kept until every user has
// signed in and had the password rehashed.
const legacyPattern = /^([0-9a-f]{32}):([0-9a-f]{128})$/
const legacyParameters: ScryptParameters = { N: 16384, r: 8, p: 1 }

export function formatHash(hash: ScryptHash): string {
  const { N, r, p } = hash.parameters
  const salt = toBase64(hash.salt)
  const key = toBase64(hash.key)
  return `$scrypt$ln=${Math.log2(N)},r=${r},p=${p}$${salt}$${key}`
}

export function parseHash(hash: string): ScryptHash | undefined {
  const phc = phcPattern.exec(hash)
  if (phc !== null) {
    return parsePhc(hash, phc)
  }

  const legacy = legacyPattern.exec(hash)
  if (legacy !== null) {
    return {
      parameters: legacyParameters,
      salt: Buffer.from(legacy[1]),
      key: Buffer.from(legacy[2], 'hex'),
    }
  }

  return undefined
}

function parsePhc(
  hash: string,
  match: RegExpExecArray,
): ScryptHash | undefined {
  const parsed: ScryptHash = {
    parameters: {
      N: 2 ** Number(match[1]),
      r: Number(match[2]),
      p: Number(match[3]),
    },
    salt: Buffer.from(match[4], 'base64'),
    key: Buffer.from(match[5], 'base64'),
  }
  return formatHash(parsed) === hash ? parsed : undefined
}

function toBase64(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=+$/, '')
}
