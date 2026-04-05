import { createHandler } from './crypto-handler.js'
import { scrypt as callbackCrypt } from './crypto-wrapper.js'
import type { log } from '../../log.js'

export async function scrypt (
  log: log,
  secret: string,
  salt: string
): Promise<string> {
  return await new Promise((resolve, reject) => {
    const handler = createHandler(log, resolve, reject)
    callbackCrypt(secret, salt, handler)
  })
}
