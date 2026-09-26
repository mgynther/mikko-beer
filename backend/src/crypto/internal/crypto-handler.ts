import type { log } from '../log.js'

export function createHandler(
  log: log,
  resolve: (key: Buffer) => void,
  reject: (error: Error | null) => void,
): (err: unknown, key: Buffer | undefined) => void {
  return function (err: unknown, key: Buffer | undefined): void {
    if (key === undefined) {
      log(`crypt failed: ${String(err)}`)
      // Not exposing error details to avoid using it in response.
      reject(new Error('unknown error'))
      return
    }
    resolve(key)
  }
}
