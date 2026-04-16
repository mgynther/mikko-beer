import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('review')
    .alterColumn('additional_info', (col) => col.setNotNull())
    .alterColumn('rating', (col) => col.setNotNull())
    .alterColumn('smell', (col) => col.setNotNull())
    .alterColumn('taste', (col) => col.setNotNull())
    .alterColumn('time', (col) => col.setNotNull())
    .alterColumn('created_at', (col) => col.setNotNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('review')
    .alterColumn('additional_info', (col) => col.dropNotNull())
    .alterColumn('rating', (col) => col.dropNotNull())
    .alterColumn('smell', (col) => col.dropNotNull())
    .alterColumn('taste', (col) => col.dropNotNull())
    .alterColumn('time', (col) => col.dropNotNull())
    .alterColumn('created_at', (col) => col.dropNotNull())
    .execute()
}
