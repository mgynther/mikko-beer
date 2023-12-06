import { type Kysely, sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('review')
    .addColumn('review_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('beer', 'uuid', (col) =>
      col.references('beer.beer_id').notNull()
    )
    .addColumn('additional_info', 'text')
    .addColumn('container', 'uuid', (col) =>
      col.references('container.container_id').notNull()
    )
    .addColumn('location', 'text')
    .addColumn('rating', 'integer')
    .addColumn('smell', 'text')
    .addColumn('taste', 'text')
    .addColumn('time', 'timestamptz')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('review').execute()
}
