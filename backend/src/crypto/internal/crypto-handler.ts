import type { log } from '../log.js'

export function createHandler(
  log: log,
  resolve: (value: string) => void,
  reject: (error: Error | null) => void,
): (err: Error | null, key: Buffer | undefined) => void {
  return function (err: Error | null, key: Buffer | undefined): void {
    if (key === undefined) {
      log(`crypt failed: ${String(err)}`)
      // Not exposing error details to avoid using it in response.
      reject(new Error('unknown error'))
      return
    }
    resolve(key.toString('hex'))
  }
}
