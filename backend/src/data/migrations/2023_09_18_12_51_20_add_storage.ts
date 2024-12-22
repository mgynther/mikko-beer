import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('storage')
    .addColumn('storage_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('beer', 'uuid', (col) =>
      col.references('beer.beer_id').notNull()
    )
    .addColumn('best_before', 'timestamp')
    .addColumn('container', 'uuid', (col) =>
      col.references('container.container_id').notNull()
    )
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('storage').execute()
}
