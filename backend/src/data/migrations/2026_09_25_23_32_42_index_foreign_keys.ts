import type { Kysely } from 'kysely'

// Every foreign key is the leading column of an index, so that lookups from
// the referenced side and the checks behind deleting a referenced row do not
// scan the whole table. PostgreSQL indexes primary keys and unique constraints
// but never the referencing side of a foreign key.
const foreignKeyIndexes = [
  { table: 'beer_brewery', column: 'brewery' },
  { table: 'beer_style', column: 'style' },
  { table: 'review', column: 'beer' },
  { table: 'review', column: 'container' },
  { table: 'review', column: 'location' },
  { table: 'storage', column: 'beer' },
  { table: 'storage', column: 'container' },
  { table: 'style_relationship', column: 'child' },
]

// Duplicates of a primary key: (user_id, type) and (user_id) respectively.
const redundantIndexes = [
  { table: 'sign_in_method', column: 'user_id' },
  { table: 'password_sign_in_method', column: 'user_id' },
]

function indexName({
  table,
  column,
}: {
  table: string
  column: string
}): string {
  return `${table}_${column}_index`
}

export async function up(db: Kysely<any>): Promise<void> {
  for (const index of foreignKeyIndexes) {
    /* eslint-disable-next-line no-await-in-loop --
     * Schema changes run one at a time in the migration's transaction.
     */
    await db.schema
      .createIndex(indexName(index))
      .on(index.table)
      .column(index.column)
      .execute()
  }
  for (const index of redundantIndexes) {
    /* eslint-disable-next-line no-await-in-loop --
     * Schema changes run one at a time in the migration's transaction.
     */
    await db.schema.dropIndex(indexName(index)).execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const index of redundantIndexes) {
    /* eslint-disable-next-line no-await-in-loop --
     * Schema changes run one at a time in the migration's transaction.
     */
    await db.schema
      .createIndex(indexName(index))
      .on(index.table)
      .column(index.column)
      .execute()
  }
  for (const index of foreignKeyIndexes) {
    /* eslint-disable-next-line no-await-in-loop --
     * Schema changes run one at a time in the migration's transaction.
     */
    await db.schema.dropIndex(indexName(index)).execute()
  }
}
