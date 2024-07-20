import { emptySplitApi } from '../api'

import { type Pagination } from '../../core/types'
import { reviewStatsTagTypes } from '../stats/types'

import {
  type JoinedReviewList,
  type Review,
  type ReviewRequestWrapper,
  type ReviewSorting,
} from '../../core/review/types'

import { ReviewTags } from './types'

interface ListReviewParams {
  pagination: Pagination
  sorting: ReviewSorting
}

function getStorageGetParam (storageId: string | undefined): string {
  if (storageId === undefined || storageId.length === 0) {
    return ''
  }
  return `?storage=${storageId}`
}

function getListUrl (params: ListReviewParams): string {
  const { size, skip } = params.pagination
  const { order, direction } = params.sorting
  const url =
    `/review?size=${size}&skip=${skip}&order=${order}&direction=${direction}`
  return url
}

function getSorting (sorting: ReviewSorting): string {
  const { order, direction } = sorting
  return `order=${order}&direction=${direction}`
}

interface FilteredListReviewParams {
  id: string
  sorting: ReviewSorting
}

const reviewApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getReview: build.query<{ review: Review }, string>({
      query: (id: string) => ({
        url: `/review/${id}`,
        method: 'GET'
      })
    }),
    listReviews: build.mutation<JoinedReviewList, ListReviewParams>({
      query: (params: ListReviewParams) => ({
        url: getListUrl(params),
        method: 'GET'
      })
    }),
    listReviewsByBeer: build.query<JoinedReviewList, FilteredListReviewParams>({
      query: (params: FilteredListReviewParams) => ({
        url: `/beer/${params.id}/review?${getSorting(params.sorting)}`,
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    listReviewsByBrewery: build.query<
    JoinedReviewList, FilteredListReviewParams
    >({
      query: (params: FilteredListReviewParams) => ({
        url: `/brewery/${params.id}/review?${getSorting(params.sorting)}`,
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    listReviewsByStyle: build.query<
    JoinedReviewList, FilteredListReviewParams
    >({
      query: (params: FilteredListReviewParams) => ({
        url: `/style/${params.id}/review?${getSorting(params.sorting)}`,
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    createReview: build.mutation<
    { review: Review },
    Partial<ReviewRequestWrapper>
    >({
      query: (wrapper: ReviewRequestWrapper) => ({
        url: `/review${getStorageGetParam(wrapper.storageId)}`,
        method: 'POST',
        body: wrapper.body
      }),
      invalidatesTags: [ReviewTags.Review, ...reviewStatsTagTypes()]
    }),
    updateReview: build.mutation<{ review: Review }, Partial<Review>>({
      query: (review: Review) => ({
        url: `/review/${review.id}`,
        method: 'PUT',
        body: {
          additionalInfo: review.additionalInfo,
          beer: review.beer,
          container: review.container,
          location: review.location,
          rating: review.rating,
          smell: review.smell,
          taste: review.taste,
          time: review.time
        }
      }),
      invalidatesTags: [ReviewTags.Review, ...reviewStatsTagTypes()]
    })
  })
})

export const {
  useCreateReviewMutation,
  useLazyGetReviewQuery,
  useListReviewsMutation,
  useListReviewsByBeerQuery,
  useListReviewsByBreweryQuery,
  useListReviewsByStyleQuery,
  useUpdateReviewMutation
} = reviewApi

export const { endpoints, reducerPath, reducer, middleware } = reviewApi
