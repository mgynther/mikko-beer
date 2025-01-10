import type {
  Generated,
  Insertable,
  Selectable,
  Updateable
} from 'kysely'

export interface LocationTable {
  location_id: Generated<string>
  name: string | null
  created_at: Generated<Date>
}

export type LocationRow = Selectable<LocationTable>
export type InsertableLocationRow = Insertable<LocationTable>
export type UpdateableLocationRow = Updateable<LocationTable>
