import { type Insertable, type Selectable, type Updateable } from 'kysely'

export interface SignInMethodTable {
  user_id: string
  type: 'password'
}

export type SignInMethodRow = Selectable<SignInMethodTable>
export type InsertableSignInMethodRow = Insertable<SignInMethodTable>
export type UpdateableSignInMethodRow = Updateable<SignInMethodTable>
