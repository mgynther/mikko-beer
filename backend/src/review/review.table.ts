import {
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'

export interface ReviewBasicTable {
  review_id: Generated<string>
  beer: Generated<string>
  additional_info: string | null
  container: Generated<string>
  location: string | null
  rating: number | null
  time: Date
  created_at: Generated<Date>
}

export interface ReviewTable extends ReviewBasicTable {
  smell: string | null
  taste: string | null
}

export type ReviewBasicRow = Selectable<ReviewBasicTable>
export type ReviewRow = Selectable<ReviewTable>

export type InsertableReviewRow = Insertable<ReviewTable>
export type UpdateableReviewRow = Updateable<ReviewTable>
