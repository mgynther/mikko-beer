import {
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable
} from 'kysely'

export interface ReviewTableContent {
  beer: string
  additional_info: string | null
  container: string
  location: string | null
  rating: number | null
  time: Date
  smell: string | null
  taste: string | null
}

export interface ReviewTable {
  review_id: Generated<string>
  beer: Generated<string>
  additional_info: string | null
  container: Generated<string>
  location: string | null
  rating: number | null
  time: Date
  created_at: Generated<Date>
  smell: string | null
  taste: string | null
}

export type ReviewRow = Selectable<ReviewTable>

export type InsertableReviewRow = Insertable<ReviewTable>
export type UpdateableReviewRow = Updateable<ReviewTable>

export interface DbJoinedReview {
  review_id: string
  beer_id: string
  beer_name: string | null
  breweries: Array<{
    brewery_id: string
    name: string | null
  }>
  additional_info: string | null
  container_id: string
  container_size: string | null
  container_type: string | null
  location: string | null
  rating: number | null
  styles: Array<{
    style_id: string
    name: string | null
  }>
  time: Date
  created_at: Date
}
