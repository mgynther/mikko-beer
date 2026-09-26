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

export function formatHash(hash: ScryptHash): string {
  const { N, r, p } = hash.parameters
  const salt = toBase64(hash.salt)
  const key = toBase64(hash.key)
  return `$scrypt$ln=${Math.log2(N)},r=${r},p=${p}$${salt}$${key}`
}

export function parseHash(hash: string): ScryptHash | undefined {
  const match = phcPattern.exec(hash)
  if (match === null) {
    return undefined
  }

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
