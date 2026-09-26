import { createHandler } from './crypto-handler.js'
import { scrypt as callbackCrypt } from './crypto-wrapper.js'
import type { ScryptParameters } from './scrypt-parameters.js'
import type { log } from '../log.js'

export async function scrypt(
  log: log,
  secret: string,
  salt: Buffer,
  keyLength: number,
  parameters: ScryptParameters,
): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const handler = createHandler(log, resolve, reject)
    callbackCrypt(secret, salt, keyLength, parameters, handler)
  })
}
