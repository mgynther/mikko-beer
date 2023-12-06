import {
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'

import { type Role } from '../../core/user/user'

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
