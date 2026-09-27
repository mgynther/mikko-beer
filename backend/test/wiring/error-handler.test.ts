import { suite, test } from '../test.js'
import { assertDeepEqual } from '../assert.js'
import { mockFunction } from '../mock.js'

import { createErrorHandler } from '../../src/wiring/error-handler.js'
import { beerNotFoundError } from '../../src/logic/errors.js'
import type { Level } from '../../src/console/log.js'

function createLog() {
  return mockFunction<[level: Level, ...args: unknown[]]>()
}

suite('error handler', () => {
  test('answer a controller error with its status, code and message', () => {
    const log = createLog()
    const error = beerNotFoundError('5f0c1b5e-6a4f-4d4e-9f0e-2b6a1b0f7c11')
    const response = createErrorHandler(log)(error)
    assertDeepEqual(response, {
      status: 404,
      body: { error: { code: 'BeerNotFound', message: error.message } },
    })
    assertDeepEqual(
      log.mock.calls.map((call) => call.arguments),
      [['INFO', 'controller error', '404', 'BeerNotFound']],
    )
  })

  test('answer an unknown error with 500 and its message', () => {
    const log = createLog()
    const response = createErrorHandler(log)(new TypeError('failed on purpose'))
    assertDeepEqual(response, {
      status: 500,
      body: { error: { code: 'UnknownError', message: 'failed on purpose' } },
    })
    assertDeepEqual(
      log.mock.calls.map((call) => call.arguments),
      [
        [
          'ERROR',
          'unknown error, name:',
          'TypeError, message:',
          'failed on purpose',
        ],
      ],
    )
  })

  test('answer something thrown that is not an error with 500', () => {
    const log = createLog()
    const response = createErrorHandler(log)('failed on purpose')
    assertDeepEqual(response, {
      status: 500,
      body: { error: { code: 'UnknownError', message: 'unknown error' } },
    })
    assertDeepEqual(
      log.mock.calls.map((call) => call.arguments),
      [['ERROR', 'unknown error:', 'failed on purpose']],
    )
  })
})
