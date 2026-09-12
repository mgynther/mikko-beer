import { describe, it } from 'node:test'

import { createErrorLogger } from '../../../../src/web/user/sign-in-method/sign-in-method-helper.js'
import { assertDeepEqual } from '../../../assert.js'

describe('sign-in-method-helper tests', () => {
  it('log errors on ERROR level', () => {
    const logs: unknown[][] = []
    const logger = (...args: (string | object | Error | unknown)[]) =>
      logs.push(args)
    const errorLogger = createErrorLogger(logger)
    errorLogger('testing')
    errorLogger('another call', 'second arg')
    assertDeepEqual(logs, [
      ['ERROR', 'testing'],
      ['ERROR', 'another call', 'second arg'],
    ])
  })
})
