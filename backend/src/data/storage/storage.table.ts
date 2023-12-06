import {
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'

export interface StorageTable {
  storage_id: Generated<string>
  beer: Generated<string>
  best_before: Date
  container: Generated<string>
  created_at: Generated<Date>
}

export type StorageRow = Selectable<StorageTable>

export type InsertableStorageRow = Insertable<StorageTable>
export type UpdateableStorageRow = Updateable<StorageTable>

export interface DbJoinedStorage {
  storage_id: string
  beer_id: string
  beer_name: string | null
  breweries: Array<{
    brewery_id: string
    name: string | null
  }>
  best_before: Date
  container_id: string
  container_size: string | null
  container_type: string | null
  styles: Array<{
    style_id: string
    name: string | null
  }>
  created_at: Date
}
