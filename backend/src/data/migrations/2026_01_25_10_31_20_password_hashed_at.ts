import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('password_sign_in_method')
    .addColumn('hashed_at', 'timestamp')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('password_sign_in_method')
    .dropColumn('hashed_at')
    .execute()
}
