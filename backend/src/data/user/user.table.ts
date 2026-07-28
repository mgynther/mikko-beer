import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export type Role = 'admin' | 'viewer'

// Here we could have user information such as name if it was needed.
// In this application is is not.
export interface UserTable {
  user_id: Generated<string>
  username: string | null
  role: Role
  created_at: Generated<Date>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
