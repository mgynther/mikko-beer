import { type Generated, type Insertable, type Selectable, type Updateable } from 'kysely'

export interface UserTable {
  user_id: Generated<string>
  first_name: string | null
  last_name: string | null
  username: string | null
  created_at: Generated<Date>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
