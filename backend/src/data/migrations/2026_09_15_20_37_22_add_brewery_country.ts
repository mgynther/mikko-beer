import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('brewery')
    .addColumn('country', 'varchar(2)')
    .execute()

  await db.schema
    .alterTable('brewery')
    .addCheckConstraint('brewery_country_check', sql`country ~ '^[A-Z]{2}$'`)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('brewery').dropColumn('country').execute()
}
