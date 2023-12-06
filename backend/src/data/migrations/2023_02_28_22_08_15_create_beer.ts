import { type Kysely, sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('beer')
    .addColumn('beer_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute()

  await db.schema
    .createTable('beer_brewery')
    .addColumn('beer', 'uuid', (col) =>
      col.references('beer.beer_id').notNull())
    .addColumn('brewery', 'uuid', (col) =>
      col.references('brewery.brewery_id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addUniqueConstraint('beer_brewery_unique', ['beer', 'brewery'])
    .execute()

  await db.schema
    .createTable('beer_style')
    .addColumn('beer', 'uuid', (col) =>
      col.references('beer.beer_id').notNull())
    .addColumn('style', 'uuid', (col) =>
      col.references('style.style_id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addUniqueConstraint('beer_style_unique', ['beer', 'style'])
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('style').execute()
}
