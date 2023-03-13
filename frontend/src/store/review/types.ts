export interface Review {
  id: string
  smell: string
  taste: string
}

export interface ReviewList {
  reviews: Review[]
}

export enum ReviewTags {
  Review = 'Review'
}

export function reviewTagTypes(): string[] {
  return [ ReviewTags.Review ]
}
