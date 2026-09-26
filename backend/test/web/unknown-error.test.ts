import { suite, test, before, beforeEach, after, afterEach } from '../test.js'

import { TestContext } from './test-context.js'
import { assertDeepEqual, assertEqual } from '../assert.js'
import type { Level } from '../../src/console/log.js'
import type { log } from '../../src/console/log.js'

suite('log unknown error', () => {
  const errorMessage = 'Failed on purpose'
  const failureLogger: log = (_: Level, ...args: unknown[]) => {
    if (args[0] === 'list breweries') {
      throw new Error(errorMessage)
    }
    if (args[0] === 'list locations') {
      throw 'other than object types are logged as generic errors only'
    }
  }
  const ctx = new TestContext(failureLogger)

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('log unknown error object when it happens', async () => {
    const res = await ctx.request.get(`/api/v1/brewery`, ctx.adminAuthHeaders())

    assertEqual(res.status, 500)
    assertDeepEqual(res.data, {
      error: {
        code: 'UnknownError',
        message: errorMessage,
      },
    })
  })

  test('log unknown error when it happens', async () => {
    const res = await ctx.request.get(
      `/api/v1/location`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 500)
    assertDeepEqual(res.data, {
      error: {
        code: 'UnknownError',
        message: 'unknown error',
      },
    })
  })
})
