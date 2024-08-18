import type { SelectBeerIf } from "../beer/types"
import type {
  CreateContainerIf,
  ListContainersIf
} from "../container/types"

import type { Container } from '../container/types'
import type { GetLogin } from "../login/types"
import type { ListDirection, Pagination } from '../types'

export interface FilteredListReviewParams {
  id: string
  sorting: ReviewSorting
}

export interface ListReviewParams {
  pagination: Pagination
  sorting: ReviewSorting
}

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

export interface ReviewRequestWrapper {
  body: ReviewRequest
  storageId: string | undefined
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

export interface GetReviewIf {
  useGet: () => {
    get: (reviewId: string) => Promise<Review | undefined>
  }
}

export interface ListReviewsIf {
  useList: () => {
    list: (params: ListReviewParams) => Promise<JoinedReviewList | undefined>
    reviewList: JoinedReviewList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
}

export interface ListReviewsByIf {
  useList: (params: FilteredListReviewParams) => {
    reviews: JoinedReviewList | undefined
    isLoading: boolean
  }
}

export interface CreateReviewIf {
  useCreate: () => {
    create: (request: ReviewRequestWrapper) => Promise<void>
    isLoading: boolean
    isSuccess: boolean
    review: Review | undefined
  }
  getCurrentDate: () => Date
  selectBeerIf: SelectBeerIf
  reviewContainerIf: ReviewContainerIf
}

export interface UpdateReviewIf {
  useUpdate: () => {
    update: (request: Review) => Promise<void>
    isLoading: boolean
  }
  selectBeerIf: SelectBeerIf
  reviewContainerIf: ReviewContainerIf
}

export interface ReviewContainerIf {
  createIf: CreateContainerIf
  listIf: ListContainersIf
}

export interface ReviewIf {
  get: GetReviewIf
  update: UpdateReviewIf
  login: GetLogin
}
