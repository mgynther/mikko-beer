import type { Insertable, Selectable, Updateable } from 'kysely'

export interface PasswordSignInMethodTable {
  user_id: string
  password_hash: string
  hashed_at: Date | null
}

export type PasswordSignInMethodRow = Selectable<PasswordSignInMethodTable>

export type InsertablePasswordSignInMethodRow =
  Insertable<PasswordSignInMethodTable>

export type UpdateablePasswordSignInMethodRow =
  Updateable<PasswordSignInMethodTable>
