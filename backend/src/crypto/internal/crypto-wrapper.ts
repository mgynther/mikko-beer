import { scrypt as nodeScrypt } from 'node:crypto'

export function scrypt(
  secret: string,
  salt: string,
  handler: (err: Error | null, key: Buffer | undefined) => void,
): void {
  nodeScrypt(secret, salt, 64, { N: 16384, r: 8, p: 1 }, handler)
}
