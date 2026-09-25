import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { sql } from 'kysely'

import { TestContext } from './test-context.js'
import { assertDeepEqual } from '../assert.js'

// PostgreSQL's default naming, which hand written names have to follow too:
// <table>_pkey for a primary key, <table>_<columns>_<suffix> for the rest.
// Building the name from the columns catches a name left behind by a column
// rename, which a prefix and suffix check would not.
// Not null constraints are listed from PostgreSQL 18 onwards.
const constraintSuffixes: Record<string, string> = {
  c: 'check',
  f: 'fkey',
  n: 'not_null',
  u: 'key',
}

interface NamedRow {
  name: string
  table: string
  columns: string[]
}

function expectedConstraintName(row: NamedRow & { type: string }): string {
  if (row.type === 'p') {
    return `${row.table}_pkey`
  }
  const suffix = constraintSuffixes[row.type] ?? `unexpected ${row.type}`
  return [row.table, ...row.columns, suffix].join('_')
}

function misnamed<Row extends NamedRow>(
  rows: Row[],
  expectedName: (row: Row) => string,
): string[] {
  return rows
    .filter((row) => row.name !== expectedName(row))
    .map((row) => `${row.name}, expected ${expectedName(row)}`)
}

describe('schema naming', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  it('constraints are named after their table and columns', async () => {
    const { rows } = await sql<NamedRow & { type: string }>`
      select
        c.conname as name,
        t.relname as table,
        c.contype as type,
        array(
          select a.attname::text
          from unnest(c.conkey) with ordinality k(attnum, position)
          join pg_attribute a
            on a.attrelid = c.conrelid and a.attnum = k.attnum
          order by k.position
        ) as columns
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
    `.execute(ctx.db.getDb())

    assertDeepEqual(misnamed(rows, expectedConstraintName), [])
  })

  // Indexes behind a primary key or unique constraint share its name and are
  // checked above, so only the ones created on their own are checked here.
  it('indexes are named after their table and columns', async () => {
    const { rows } = await sql<NamedRow>`
      select
        ic.relname as name,
        t.relname as table,
        array(
          select a.attname::text
          from unnest(i.indkey) with ordinality k(attnum, position)
          join pg_attribute a
            on a.attrelid = i.indrelid and a.attnum = k.attnum
          order by k.position
        ) as columns
      from pg_index i
      join pg_class ic on ic.oid = i.indexrelid
      join pg_class t on t.oid = i.indrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
        and not exists (
          select 1 from pg_constraint c where c.conindid = i.indexrelid
        )
    `.execute(ctx.db.getDb())

    assertDeepEqual(
      misnamed(rows, ({ table, columns }) =>
        [table, ...columns, 'index'].join('_'),
      ),
      [],
    )
  })
})
