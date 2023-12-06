import {
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'

export interface ContainerTable {
  container_id: Generated<string>
  type: string | null
  size: string | null
  created_at: Generated<Date>
}

export type ContainerRow = Selectable<ContainerTable>

export type InsertableContainerRow = Insertable<ContainerTable>
export type UpdateableContainerRow = Updateable<ContainerTable>
