import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { sql } from 'kysely'

import { TestContext } from './test-context.js'
import { assertDeepEqual } from '../assert.js'

// pg_index.indkey is an int2vector, which indexes from 0. Slicing it gives an
// ordinary array indexed from 1, comparable with pg_constraint.conkey.
describe('schema indexes', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('every foreign key leads an index', async () => {
    const { rows } = await sql<{ name: string }>`
      select c.conname as name
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
        and c.contype = 'f'
        and not exists (
          select 1
          from pg_index i
          where i.indrelid = c.conrelid
            and (i.indkey::int2[])[0:cardinality(c.conkey) - 1] = c.conkey
        )
      order by c.conname
    `.execute(ctx.db.getDb())

    assertDeepEqual(
      rows.map(({ name }) => name),
      [],
    )
  })

  // A unique index enforces something even when another index covers its
  // columns, so only non-unique ones can be redundant.
  it('no index repeats the leading columns of another', async () => {
    const { rows } = await sql<{ name: string }>`
      select distinct ic.relname as name
      from pg_index i
      join pg_class ic on ic.oid = i.indexrelid
      join pg_namespace n on n.oid = ic.relnamespace
      join pg_index o
        on o.indrelid = i.indrelid and o.indexrelid <> i.indexrelid
      where n.nspname = 'public'
        and not i.indisunique
        and cardinality(i.indkey::int2[]) <= cardinality(o.indkey::int2[])
        and (i.indkey::int2[])[0:cardinality(i.indkey::int2[]) - 1]
          = (o.indkey::int2[])[0:cardinality(i.indkey::int2[]) - 1]
      order by ic.relname
    `.execute(ctx.db.getDb())

    assertDeepEqual(
      rows.map(({ name }) => name),
      [],
    )
  })
})
