import * as crypto from 'node:crypto'

export function scrypt(
  secret: string,
  salt: string,
  handler: (err: Error | null, value: string) => void,
): void {
  crypto.scrypt(
    secret,
    salt,
    64,
    { N: 16384, r: 8, p: 1 },
    (error: Error | null, value: NonSharedBuffer) => {
      handler(error, value.toString('hex'))
    },
  )
}
