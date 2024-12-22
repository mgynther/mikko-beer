import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('container')
    .addColumn('container_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('type', 'text')
    .addColumn('size', 'numeric(4, 2)')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addUniqueConstraint('type_size_unique', ['type', 'size'])
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('container').execute()
}
