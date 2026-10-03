import { suite, test, before, beforeEach, after, afterEach } from '../test.js'

import { TestContext } from './test-context.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

// What the application answers for a request the web layer rejects before
// any handler. Any route will do; breweries are the simplest.
suite('web errors', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('answer a repeated query parameter as an invalid query', async () => {
    const res = await ctx.request.get(
      `/api/v1/brewery?size=10&size=11`,
      ctx.adminAuthHeaders(),
    )

    assertEqual(res.status, 400)
    assertDeepEqual(res.data, {
      error: {
        code: 'InvalidQuery',
        message: 'invalid query, most likely duplicate query parameter',
      },
    })
  })

  test('answer an unreadable body as an invalid body', async () => {
    const res = await fetch(`${ctx.baseUrl()}/api/v1/brewery`, {
      method: 'POST',
      headers: {
        ...ctx.adminAuthHeaders(),
        'content-type': 'application/json',
      },
      body: '{"name": ',
    })

    assertEqual(res.status, 400)
    assertDeepEqual(await res.json(), {
      error: {
        code: 'InvalidBody',
        message: 'invalid body, could not be read',
      },
    })
  })
})
