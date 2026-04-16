import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface ReviewTableContent {
  beer: string
  additional_info: string
  container: string
  location: string | null
  rating: number
  time: Date
  smell: string
  taste: string
}

export interface ReviewTable {
  review_id: Generated<string>
  beer: Generated<string>
  additional_info: string
  container: Generated<string>
  location: string | null
  rating: number
  time: Date
  created_at: Generated<Date>
  smell: string
  taste: string
}

export type ReviewRow = Selectable<ReviewTable>

export type InsertableReviewRow = Insertable<ReviewTable>
export type UpdateableReviewRow = Updateable<ReviewTable>

export interface DbJoinedReview {
  review_id: string
  beer_id: string
  beer_name: string
  breweries: Array<{
    brewery_id: string
    name: string
  }>
  additional_info: string
  container_id: string
  container_size: string
  container_type: string
  location: {
    location_id: string
    name: string
  } | null
  rating: number
  styles: Array<{
    style_id: string
    name: string
  }>
  time: Date
  created_at: Date
}
