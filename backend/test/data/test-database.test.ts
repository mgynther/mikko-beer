import { suite, test, before, beforeEach, after, afterEach } from '../test.js'

import { sql } from 'kysely'

import { TestContext } from './test-context.js'
import { assertEqual } from '../assert.js'

suite('test database', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  test('commit without waiting for the disk', async () => {
    const { rows } = await sql<{
      synchronous_commit: string
    }>`show synchronous_commit`.execute(ctx.db.getDb())

    assertEqual(rows[0].synchronous_commit, 'off')
  })
})
