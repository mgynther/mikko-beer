import { type Container } from '../../core/container/types'
import { type ListDirection } from '../types'

export interface Review {
  id: string
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  smell: string
  taste: string
  time: string
}

interface JoinedReviewBrewery {
  id: string
  name: string
}

interface JoinedReviewStyle {
  id: string
  name: string
}

export interface JoinedReview {
  id: string
  additionalInfo: string
  beerId: string
  beerName: string
  breweries: JoinedReviewBrewery[]
  container: Container
  location: string
  rating: number
  styles: JoinedReviewStyle[]
  time: string
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

export interface ReviewList {
  reviews: Review[]
}

export type ReviewSortingOrder =
  | 'beer_name'
  | 'brewery_name'
  | 'rating'
  | 'time'

export interface ReviewSorting {
  order: ReviewSortingOrder
  direction: ListDirection
}

export interface JoinedReviewList {
  reviews: JoinedReview[]
  sorting?: ReviewSorting
}

export enum ReviewTags {
  Review = 'Review'
}

export function reviewTagTypes (): string[] {
  return [ReviewTags.Review]
}
