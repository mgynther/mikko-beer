import { type Generated, type Insertable, type Selectable, type Updateable } from 'kysely'

export interface StyleTable {
  style_id: Generated<string>
  name: string | null
  created_at: Generated<Date>
}

export interface StyleRelationshipTable {
  parent: Generated<string>
  child: Generated<string>
}

export type StyleRow = Selectable<StyleTable>

export type InsertableStyleRow = Insertable<StyleTable>
export type UpdateableStyleRow = Updateable<StyleTable>

export type StyleRelationshipRow = Selectable<StyleRelationshipTable>
export type InsertableStyleRelationshipRow = Insertable<StyleRelationshipTable>
