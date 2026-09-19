import type { Pagination } from '../pagination'

export type ListDirection = 'asc' | 'desc'

export type ReviewSortingOrder =
  'beer_name' | 'brewery_name' | 'rating' | 'time'

export interface ReviewSorting {
  order: ReviewSortingOrder
  direction: ListDirection
}

export interface ReviewListFilter {
  minRating: number
  maxRating: number
  minTime: number
  maxTime: number
}

export interface ListReviewParams {
  filter: ReviewListFilter
  pagination: Pagination
  sorting: ReviewSorting
}

export interface IdFilteredListReviewParams {
  filter: ReviewListFilter
  id: string
  sorting: ReviewSorting
}

export interface ReviewRequest {
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  smell: string
  taste: string
  time: string
}

export interface ReviewRequestWrapper {
  body: ReviewRequest
  storageId: string
}

export interface UpdateReviewRequest extends ReviewRequest {
  id: string
}
