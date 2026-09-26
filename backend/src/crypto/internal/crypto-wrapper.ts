import { scrypt as nodeScrypt } from 'node:crypto'

import type { ScryptParameters } from '../scrypt-parameters.js'

export function scrypt(
  secret: string,
  salt: Buffer,
  keyLength: number,
  parameters: ScryptParameters,
  handler: (err: unknown, key: Buffer | undefined) => void,
): void {
  const { N, r, p } = parameters
  // Exactly the memory these parameters need, so a stored hash is verified
  // whatever its parameters rather than refused by the default limit.
  const maxmem = 128 * r * (N + p + 2)
  nodeScrypt(secret, salt, keyLength, { N, r, p, maxmem }, handler)
}
