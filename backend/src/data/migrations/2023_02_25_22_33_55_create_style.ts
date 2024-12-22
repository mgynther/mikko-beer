import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('style')
    .addColumn('style_id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (col) => col.unique())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute()

  await db.schema
    .createTable('style_relationship')
    .addColumn('parent', 'uuid', (col) =>
      col.references('style.style_id').notNull())
    .addColumn('child', 'uuid', (col) =>
      col.references('style.style_id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addUniqueConstraint('parent_child_unique', ['parent', 'child'])
    .addCheckConstraint('parent_child_not_equal', sql`parent != child`)
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('style').execute()
}
