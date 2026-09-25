import type { Kysely } from 'kysely'

// Constraints follow PostgreSQL's default naming, <table>_<columns>_<suffix>
// with the suffix pkey, key, fkey or check. These were either named by hand
// before that was the rule, or kept an old column name through a rename.
// Renaming a primary key or unique constraint renames its index as well.
const renames = [
  { table: 'user', from: 'user_email_key', to: 'user_username_key' },
  {
    table: 'sign_in_method',
    from: 'sign_in_method_primary_key',
    to: 'sign_in_method_pkey',
  },
  {
    table: 'style_relationship',
    from: 'parent_child_unique',
    to: 'style_relationship_parent_child_key',
  },
  {
    table: 'style_relationship',
    from: 'parent_child_not_equal',
    to: 'style_relationship_parent_child_check',
  },
  {
    table: 'beer_brewery',
    from: 'beer_brewery_unique',
    to: 'beer_brewery_beer_brewery_key',
  },
  {
    table: 'beer_style',
    from: 'beer_style_unique',
    to: 'beer_style_beer_style_key',
  },
  {
    table: 'container',
    from: 'type_size_unique',
    to: 'container_type_size_key',
  },
]

export async function up(db: Kysely<any>): Promise<void> {
  for (const { table, from, to } of renames) {
    /* eslint-disable-next-line no-await-in-loop --
     * Schema changes run one at a time in the migration's transaction.
     */
    await db.schema.alterTable(table).renameConstraint(from, to).execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const { table, from, to } of renames) {
    /* eslint-disable-next-line no-await-in-loop --
     * Schema changes run one at a time in the migration's transaction.
     */
    await db.schema.alterTable(table).renameConstraint(to, from).execute()
  }
}
