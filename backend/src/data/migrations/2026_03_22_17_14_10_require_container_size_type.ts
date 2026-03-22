import type { Kysely } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('container')
    .alterColumn('size', (col) => col.setNotNull())
    .alterColumn('type', (col) => col.setNotNull())
    .execute()

  await db.schema
    .alterTable('review')
    .alterColumn('container', (col) => col.setNotNull())
    .execute()

  await db.schema
    .alterTable('storage')
    .alterColumn('container', (col) => col.setNotNull())
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('container')
    .alterColumn('size', (col) => col.dropNotNull())
    .alterColumn('type', (col) => col.dropNotNull())
    .execute()

  await db.schema
    .alterTable('review')
    .alterColumn('container', (col) => col.dropNotNull())
    .execute()

  await db.schema
    .alterTable('storage')
    .alterColumn('container', (col) => col.dropNotNull())
    .execute()
}
