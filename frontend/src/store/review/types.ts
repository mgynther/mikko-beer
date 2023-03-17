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

export enum ReviewTags {
  Review = 'Review'
}

export function reviewTagTypes (): string[] {
  return [ReviewTags.Review]
}
