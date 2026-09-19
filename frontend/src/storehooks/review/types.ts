import type { Container } from '../container/types'
import type { Location } from '../location/types'
import type { Pagination } from '../types'

// The shapes these hooks work on and the validators they are given, declared
// here rather than imported from types/. See the comment in
// storehooks/style/types.ts.
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
  location: Location | undefined
  rating: number
  styles: JoinedReviewStyle[]
  time: string
}

export type ReviewSortingOrder =
  'beer_name' | 'brewery_name' | 'rating' | 'time'

export type ListDirection = 'asc' | 'desc'

export interface ReviewSorting {
  order: ReviewSortingOrder
  direction: ListDirection
}

export interface JoinedReviewList {
  reviews: JoinedReview[]
  sorting: ReviewSorting
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

// The store functions these hooks are given. See the comment in
// storehooks/brewery/types.ts.
export type UseGetReview = () => {
  get: (reviewId: string) => Promise<unknown>
}

export type UseListReviews = () => {
  list: (params: ListReviewParams) => Promise<unknown>
  data: unknown
  isFetching: boolean
  isUninitialized: boolean
}

export type UseListReviewsBy = (params: IdFilteredListReviewParams) => {
  data: unknown
  isLoading: boolean
}

export type UseCreateReview = () => {
  create: (request: ReviewRequestWrapper) => Promise<void>
  data: unknown
  isLoading: boolean
  isSuccess: boolean
}

export type UseUpdateReview = () => {
  update: (review: Review) => Promise<unknown>
  isLoading: boolean
}

export type ValidateReview = (result: unknown) => Review

export type ValidateReviewOrUndefined = (result: unknown) => Review | undefined

export type ValidateJoinedReviewList = (result: unknown) => JoinedReviewList

export type ValidateJoinedReviewListOrUndefined = (
  result: unknown,
) => JoinedReviewList | undefined

export interface CreateReviewHookIf {
  useCreate: () => {
    create: (request: ReviewRequestWrapper) => Promise<void>
    isLoading: boolean
    isSuccess: boolean
    review: Review | undefined
  }
}

export interface GetReviewHookIf {
  useGet: () => {
    get: (reviewId: string) => Promise<Review>
  }
}

export interface ListReviewsHookIf {
  useList: () => {
    list: (params: ListReviewParams) => Promise<JoinedReviewList>
    reviewList: JoinedReviewList | undefined
    isLoading: boolean
    isUninitialized: boolean
  }
}

export interface ListReviewsByHookIf {
  useList: (params: IdFilteredListReviewParams) => {
    reviews: JoinedReviewList | undefined
    isLoading: boolean
  }
}

export interface UpdateReviewHookIf {
  useUpdate: () => {
    update: (request: Review) => Promise<void>
    isLoading: boolean
  }
}
