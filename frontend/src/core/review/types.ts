import type { SelectBeerIf } from '../beer/types'
import type {
  CreateContainerIf,
  ListContainersIf,
  Container,
} from '../container/types'
import type { Location, SearchLocationIf } from '../location/types'

import type { GetLogin } from '../login/types'
import type {
  InfiniteScroll,
  ListDirection,
  Pagination,
  UseDebounce,
  UseUrlSearchParams,
  YearMonth,
} from '../types'

export interface ReviewListFilter {
  minRating: number
  maxRating: number
  minTime: number
  maxTime: number
}

export interface IdFilteredListReviewParams {
  filter: ReviewListFilter
  id: string
  sorting: ReviewSorting
}

export interface ListReviewParams {
  filter: ReviewListFilter
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
  location: Location | undefined
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
  storageId: string
}

export interface ReviewList {
  reviews: Review[]
}

export type ReviewSortingOrder =
  'beer_name' | 'brewery_name' | 'rating' | 'time'

export interface ReviewSorting {
  order: ReviewSortingOrder
  direction: ListDirection
}

export interface JoinedReviewList {
  reviews: JoinedReview[]
  sorting: ReviewSorting
}

export interface GetReviewIf {
  useGet: () => {
    get: (reviewId: string) => Promise<Review>
  }
}

export type SetSearch = (state: Record<string, string>) => void

export interface ListFilterIf {
  getUseDebounce: <T>() => UseDebounce<T>
  minTime: YearMonth
  maxTime: YearMonth
  setSearch: SetSearch
  useUrlSearchParams: UseUrlSearchParams
}

type UseListReviews = () => {
  list: (params: ListReviewParams) => Promise<JoinedReviewList>
  reviewList: JoinedReviewList | undefined
  isLoading: boolean
  isUninitialized: boolean
}

export interface ListReviewsHookIf {
  useList: UseListReviews
}

export interface ListReviewsIf {
  useList: UseListReviews
  infiniteScroll: InfiniteScroll
  filterIf: ListFilterIf
}

export interface UseListReviewsByResult {
  reviews: JoinedReviewList | undefined
  isLoading: boolean
}

type UseListReviewsBy = (
  params: IdFilteredListReviewParams,
) => UseListReviewsByResult

export interface ListReviewsByHookIf {
  useList: UseListReviewsBy
}

export interface ListReviewsByIf {
  useList: UseListReviewsBy
  filterIf: ListFilterIf
  reviewIf: ReviewIf
}

type UseCreateReview = () => {
  create: (request: ReviewRequestWrapper) => Promise<void>
  isLoading: boolean
  isSuccess: boolean
  review: Review | undefined
}

export interface CreateReviewHookIf {
  useCreate: UseCreateReview
}

export interface CreateReviewIf {
  useCreate: UseCreateReview
  getCurrentDate: () => Date
  searchLocationIf: SearchLocationIf
  selectBeerIf: SelectBeerIf
  reviewContainerIf: ReviewContainerIf
}

type UseUpdateReview = () => {
  update: (request: Review) => Promise<void>
  isLoading: boolean
}

export interface UpdateReviewHookIf {
  useUpdate: UseUpdateReview
}

export interface UpdateReviewIf {
  useUpdate: UseUpdateReview
  searchLocationIf: SearchLocationIf
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
  getLogin: GetLogin
}
