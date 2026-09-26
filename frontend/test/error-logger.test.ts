import { expect, test, vitest } from 'vitest'
import { createErrorLogger } from './error-logger'

test('error-logger logs', async () => {
  const logger = vitest.fn()
  const errorLogger = createErrorLogger('testing', logger)
  const thrower = (): Promise<never> => Promise.reject(new Error('error'))
  await thrower().catch(errorLogger)
  expect(logger.mock.calls).toEqual([['testing', new Error('error')]])
})
