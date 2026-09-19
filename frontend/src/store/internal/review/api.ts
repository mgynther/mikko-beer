import { emptySplitApi } from '../api'

import { reviewStatsTagTypes } from '../stats/tags'
import { storageTagTypes } from '../storage/tags'

import type {
  IdFilteredListReviewParams,
  ListReviewParams,
  ReviewListFilter,
  ReviewRequestWrapper,
  ReviewSorting,
  UpdateReviewRequest,
} from './requests'

import { reviewTagTypes } from './tags'

function getStorageGetParam(storageId: string): string {
  if (storageId.length === 0) {
    return ''
  }
  return `?storage=${storageId}`
}

function getListUrl(params: ListReviewParams): string {
  const { size, skip } = params.pagination
  // prettier-ignore
  const url =
    `/review?size=${
    size
  }&skip=${
    skip
  }&${
    getSorting(params.sorting)
  }&${
    getFilter(params.filter)
  }`
  return url
}

function getSorting(sorting: ReviewSorting): string {
  const { order, direction } = sorting
  return `order=${order}&direction=${direction}`
}

function getFilter(filter: ReviewListFilter): string {
  return `min_rating=${filter.minRating}&max_rating=${
    filter.maxRating
  }&min_time=${filter.minTime}&max_time=${filter.maxTime}`
}

const reviewApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getReview: build.query<unknown, string>({
      query: (id: string) => ({
        url: `/review/${id}`,
        method: 'GET',
      }),
    }),
    listReviews: build.query<unknown, ListReviewParams>({
      query: (params: ListReviewParams) => ({
        url: getListUrl(params),
        method: 'GET',
      }),
    }),
    listReviewsByBeer: build.query<unknown, IdFilteredListReviewParams>({
      query: (params: IdFilteredListReviewParams) => ({
        // prettier-ignore
        url: `/beer/${
          params.id
        }/review?${
          getSorting(params.sorting)
        }&${
          getFilter(params.filter)
        }`,
        method: 'GET',
      }),
      providesTags: [...reviewTagTypes()],
    }),
    listReviewsByBrewery: build.query<unknown, IdFilteredListReviewParams>({
      query: (params: IdFilteredListReviewParams) => ({
        // prettier-ignore
        url: `/brewery/${
          params.id
        }/review?${
          getSorting(params.sorting)
        }&${
          getFilter(params.filter)
        }`,
        method: 'GET',
      }),
      providesTags: [...reviewTagTypes()],
    }),
    listReviewsByLocation: build.query<unknown, IdFilteredListReviewParams>({
      query: (params: IdFilteredListReviewParams) => ({
        // prettier-ignore
        url: `/location/${
          params.id
        }/review?${
          getSorting(params.sorting)
        }&${
          getFilter(params.filter)
        }`,
        method: 'GET',
      }),
      providesTags: [...reviewTagTypes()],
    }),
    listReviewsByStyle: build.query<unknown, IdFilteredListReviewParams>({
      query: (params: IdFilteredListReviewParams) => ({
        // prettier-ignore
        url: `/style/${
          params.id
        }/review?${
          getSorting(params.sorting)
        }&${
          getFilter(params.filter)
        }`,
        method: 'GET',
      }),
      providesTags: [...reviewTagTypes()],
    }),
    createReview: build.mutation<unknown, Partial<ReviewRequestWrapper>>({
      query: (wrapper: ReviewRequestWrapper) => ({
        url: `/review${getStorageGetParam(wrapper.storageId)}`,
        method: 'POST',
        body: wrapper.body,
      }),
      invalidatesTags: [
        ...reviewTagTypes(),
        ...storageTagTypes(),
        ...reviewStatsTagTypes(),
      ],
    }),
    updateReview: build.mutation<unknown, UpdateReviewRequest>({
      query: (review: UpdateReviewRequest) => ({
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
          time: review.time,
        },
      }),
      invalidatesTags: [...reviewTagTypes(), ...reviewStatsTagTypes()],
    }),
  }),
})

export const {
  useCreateReviewMutation,
  useLazyGetReviewQuery,
  useLazyListReviewsQuery,
  useListReviewsByBeerQuery,
  useListReviewsByBreweryQuery,
  useListReviewsByLocationQuery,
  useListReviewsByStyleQuery,
  useUpdateReviewMutation,
} = reviewApi

export const { endpoints, reducerPath, reducer, middleware } = reviewApi
