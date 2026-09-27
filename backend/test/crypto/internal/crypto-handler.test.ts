import { suite, test } from '../../test.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { mockFunction } from '../../mock.js'
import { createHandler } from '../../../src/crypto/internal/crypto-handler.js'

suite('crypto handler', () => {
  test('resolve key without error', () => {
    const resolve = mockFunction<[key: Buffer]>()
    const reject = mockFunction<[error: Error | null]>()
    const log = mockFunction<string[]>()
    const handler = createHandler(log, resolve, reject)
    const key = Buffer.from([0x01, 0xab])
    handler(null, key)
    assertEqual(reject.mock.callCount(), 0)
    assertEqual(resolve.mock.callCount(), 1)
    assertDeepEqual(resolve.mock.calls[0].arguments, [key])
  })

  // Node's scrypt passes no key when it fails asynchronously, although its
  // typings declare the key as always present.
  test('reject with error and no key', () => {
    const resolve = mockFunction<[key: Buffer]>()
    const reject = mockFunction<[error: Error | null]>()
    const log = mockFunction<string[]>()
    const handler = createHandler(log, resolve, reject)
    const errorMessage = 'testing'
    const error = new Error(errorMessage)
    handler(error, undefined)
    assertEqual(resolve.mock.callCount(), 0)
    assertEqual(reject.mock.callCount(), 1)
    assertEqual(log.mock.callCount(), 1)
    assertDeepEqual(reject.mock.calls[0].arguments, [
      new Error('unknown error'),
    ])
    assertDeepEqual(log.mock.calls[0].arguments, [
      `crypt failed: Error: ${errorMessage}`,
    ])
  })
})
