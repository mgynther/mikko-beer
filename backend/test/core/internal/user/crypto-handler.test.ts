import { describe, it } from 'node:test'
import { assertDeepEqual, assertEqual } from '../../../assert.js'
import { createHandler } from '../../../../src/core/internal/user/crypto-handler.js'
import { Level } from '../../../../src/core/log.js'

describe('crypto handler', () => {
  it('resolve without error', (t) => {
    const mockImpl = () => undefined
    const resolve = t.mock.fn(mockImpl)
    const reject = t.mock.fn(mockImpl)
    const log = t.mock.fn(mockImpl)
    const handler = createHandler(log, resolve, reject)
    const resolveValue = 'value'
    handler(null, resolveValue)
    assertEqual(reject.mock.callCount(), 0)
    assertEqual(resolve.mock.callCount(), 1)
    assertDeepEqual(resolve.mock.calls[0].arguments, [resolveValue])
  })

  it('reject with error', (t) => {
    const mockImpl = () => undefined
    const resolve = t.mock.fn(mockImpl)
    const reject = t.mock.fn(mockImpl)
    const log = t.mock.fn(mockImpl)
    const handler = createHandler(log, resolve, reject)
    const errorMessage = 'testing'
    const error = new Error(errorMessage)
    handler(error, '')
    assertEqual(resolve.mock.callCount(), 0)
    assertEqual(reject.mock.callCount(), 1)
    assertEqual(log.mock.callCount(), 1)
    assertDeepEqual(reject.mock.calls[0].arguments, [
      new Error('unknown error'),
    ])
    assertDeepEqual(log.mock.calls[0].arguments, [
      Level.ERROR,
      `crypt failed: ${errorMessage}`,
    ])
  })
})
