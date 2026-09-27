import { suite, test } from '../../test.js'
import { assertDeepEqual, assertEqual } from '../../assert.js'
import { mockFunction } from '../../mock.js'
import { createStopHandler } from '../../../src/web/internal/stop-handler.js'

suite('stop handler', () => {
  test('resolve without error', () => {
    const resolve = mockFunction<[]>()
    const reject = mockFunction<[error: Error]>()
    const handler = createStopHandler(resolve, reject)
    handler(undefined)
    assertEqual(reject.mock.callCount(), 0)
    assertEqual(resolve.mock.callCount(), 1)
  })

  test('reject with error', () => {
    const resolve = mockFunction<[]>()
    const reject = mockFunction<[error: Error]>()
    const handler = createStopHandler(resolve, reject)
    const error = new Error('testing')
    handler(error)
    assertEqual(resolve.mock.callCount(), 0)
    assertEqual(reject.mock.callCount(), 1)
    assertDeepEqual(reject.mock.calls[0].arguments, [error])
  })
})
