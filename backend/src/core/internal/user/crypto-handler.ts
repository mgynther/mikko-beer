import { Level } from '../../log'
import type { log } from '../../log'

export function createHandler (
  log: log,
  resolve: (value: string) => void,
  reject: (error: Error | null) => void
): (err: Error | null, value: string) => void {
  return function (err: Error | null, value: string): void {
    if (err === null) {
      resolve(value)
      return
    }
    log(Level.ERROR, `crypt failed: ${err.message}`)
    // Not exposing error details to avoid using it in response.
    reject(new Error('unknown error'))
  }
}
