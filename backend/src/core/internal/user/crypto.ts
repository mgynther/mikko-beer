import { createHandler } from './crypto-handler'
import { scrypt as callbackCrypt } from './crypto-wrapper'
import type { log } from '../../log'

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
