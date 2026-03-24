import { createHandler } from './crypto-handler'
import { scrypt as callbackCrypt } from './crypto-wrapper'

export async function scrypt (secret: string, salt: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const handler = createHandler(resolve, reject)
    callbackCrypt(secret, salt, handler)
  })
}
