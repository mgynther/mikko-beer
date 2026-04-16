import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('location')
    .alterColumn('name', (col) => col.setNotNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('location')
    .alterColumn('name', (col) => col.dropNotNull())
    .execute()
}
