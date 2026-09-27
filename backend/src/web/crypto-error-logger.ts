import type { log } from '../console/log.js'
import type { log as CryptoLog } from '../crypto/log.js'

export function createCryptoErrorLogger(logger: log): CryptoLog {
  return (...args: string[]): void => {
    logger('ERROR', ...args)
  }
}
