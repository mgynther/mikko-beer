import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('brewery')
    .addColumn('brewery_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (col) => col.unique())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('brewery').execute()
}
