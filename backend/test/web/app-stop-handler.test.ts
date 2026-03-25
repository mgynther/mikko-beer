import { describe, it } from 'node:test'
import { assertDeepEqual, assertEqual } from '../assert'
import { createStopHandler } from '../../src/web/app-stop-handler'

describe('app stopHandler', () => {
  it('resolve without error', (t) => {
    const mockImpl = () => undefined
    const resolve = t.mock.fn(mockImpl)
    const reject = t.mock.fn(mockImpl)
    const handler = createStopHandler(resolve, reject)
    handler(undefined)
    assertEqual(reject.mock.callCount(), 0)
    assertEqual(resolve.mock.callCount(), 1)
  })

  it('reject with error', (t) => {
    const mockImpl = () => undefined
    const resolve = t.mock.fn(mockImpl)
    const reject = t.mock.fn(mockImpl)
    const handler = createStopHandler(resolve, reject)
    const error = new Error('testing')
    handler(error)
    assertEqual(resolve.mock.callCount(), 0)
    assertEqual(reject.mock.callCount(), 1)
    assertDeepEqual(
      reject.mock.calls[0].arguments,
      [error]
    )
  })
})
