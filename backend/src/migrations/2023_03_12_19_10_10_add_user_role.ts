import { type Kysely, sql } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('user')
    .addColumn('role', 'text', (col) =>
      col.notNull().check(sql`role in ('admin', 'viewer')`)
    )
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('user')
    .dropColumn('role')
    .execute()
}
