import { test } from '../test'
import { assertDeepEqual } from '../assert'
import { mockFunction } from '../mock'
import { createErrorLogger } from '../../src/routing/error-logger'

test('error-logger logs', async () => {
  const logger = mockFunction()
  const errorLogger = createErrorLogger('testing', logger)
  const thrower = (): Promise<never> => Promise.reject(new Error('error'))
  await thrower().catch(errorLogger)
  assertDeepEqual(logger.mock.calls, [['testing', new Error('error')]])
})
