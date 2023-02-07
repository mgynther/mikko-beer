import { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface BreweryTable {
  brewery_id: Generated<string>
  name: string | null
  created_at: Generated<Date>
}

export type BreweryRow = Selectable<BreweryTable>
export type InsertableBreweryRow = Insertable<BreweryTable>
export type UpdateableBreweryRow = Updateable<BreweryTable>
