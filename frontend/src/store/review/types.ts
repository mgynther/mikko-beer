import { type Container } from '../container/types'

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

interface BreweryReviewBrewery {
  id: string
  name: string
}

interface BreweryReviewStyle {
  id: string
  name: string
}

export interface BreweryReview {
  id: string
  additionalInfo: string
  beerId: string
  beerName: string
  breweries: BreweryReviewBrewery[]
  container: Container
  location: string
  rating: number
  styles: BreweryReviewStyle[]
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

export interface BreweryReviewList {
  reviews: BreweryReview[]
}

export enum ReviewTags {
  Review = 'Review'
}

export function reviewTagTypes (): string[] {
  return [ReviewTags.Review]
}
