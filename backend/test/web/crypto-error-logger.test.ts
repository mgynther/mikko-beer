import { suite, test } from '../test.js'
import { assertDeepEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import type { Level } from '../../src/console/log.js'
import { createCryptoErrorLogger } from '../../src/web/crypto-error-logger.js'

suite('crypto error logger', () => {
  test('logs every call on ERROR level', () => {
    const logger = mockFunction<[level: Level, ...args: unknown[]]>()
    const errorLogger = createCryptoErrorLogger(logger)
    errorLogger('crypt failed: out of memory')
    errorLogger('stored hash is malformed', 'second arg')
    assertDeepEqual(
      logger.mock.calls.map((call) => call.arguments),
      [
        ['ERROR', 'crypt failed: out of memory'],
        ['ERROR', 'stored hash is malformed', 'second arg'],
      ],
    )
  })
})
