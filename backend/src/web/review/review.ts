import type { Pagination } from '../pagination.js'
import type {
  BodyRequest,
  IdBodyRequest,
  IdRequest,
  PaginationRequest,
} from '../request.js'

export interface CreatedOrUpdatedReview {
  id: string
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  time: string
  smell: string
  taste: string
}

export interface ReadReview {
  id: string
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  time: string
  smell: string
  taste: string
}

export interface ListedReview {
  id: string
  additionalInfo: string
  beerId: string
  beerName: string
  breweries: Array<{
    id: string
    name: string
  }>
  container: {
    id: string
    type: string
    size: string
  }
  location:
    | {
        id: string
        name: string
      }
    | undefined
  rating: number
  styles: Array<{
    id: string
    name: string
  }>
  time: string
}

export interface ReviewSorting {
  order: 'beer_name' | 'brewery_name' | 'rating' | 'time'
  direction: 'asc' | 'desc'
}

export interface ReviewBody {
  review: CreatedOrUpdatedReview
}

export interface ReadReviewBody {
  review: ReadReview
}

export interface FilteredReviewListBody {
  reviews: ListedReview[]
  sorting: ReviewSorting
}

export interface ReviewListBody {
  reviews: ListedReview[]
  pagination: Pagination
  sorting: ReviewSorting
}

export interface ReviewListQuery {
  order: string | undefined
  direction: string | undefined
  minRating: string | undefined
  maxRating: string | undefined
  minTime: string | undefined
  maxTime: string | undefined
}

export interface CreateReviewRequest extends BodyRequest {
  // The storage the reviewed beer is taken from, if any.
  storage: string | undefined
}

export interface ListReviewsByIdRequest extends IdRequest {
  list: ReviewListQuery
}

export interface ListReviewsRequest extends PaginationRequest {
  list: ReviewListQuery
}

export interface ReviewHandlers {
  create: (request: CreateReviewRequest) => Promise<ReviewBody>
  update: (request: IdBodyRequest) => Promise<ReviewBody>
  find: (request: IdRequest) => Promise<ReadReviewBody>
  listByBeer: (
    request: ListReviewsByIdRequest,
  ) => Promise<FilteredReviewListBody>
  listByBrewery: (
    request: ListReviewsByIdRequest,
  ) => Promise<FilteredReviewListBody>
  listByLocation: (
    request: ListReviewsByIdRequest,
  ) => Promise<FilteredReviewListBody>
  listByStyle: (
    request: ListReviewsByIdRequest,
  ) => Promise<FilteredReviewListBody>
  list: (request: ListReviewsRequest) => Promise<ReviewListBody>
}
