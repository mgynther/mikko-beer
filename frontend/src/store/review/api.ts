import { emptySplitApi } from '../api'

import { type Pagination } from '../types'
import { reviewStatsTagTypes } from '../stats/types'

import {
  type JoinedReviewList,
  type Review,
  type ReviewRequest,
  ReviewTags
} from './types'

const reviewApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getReview: build.query<{ review: Review }, string>({
      query: (id: string) => ({
        url: `/review/${id}`,
        method: 'GET'
      })
    }),
    listReviews: build.query<JoinedReviewList, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/review?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    listReviewsByBeer: build.query<JoinedReviewList, string>({
      query: (beerId: string) => ({
        url: `/beer/${beerId}/review`,
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    listReviewsByBrewery: build.query<JoinedReviewList, string>({
      query: (breweryId: string) => ({
        url: `/brewery/${breweryId}/review`,
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    createReview: build.mutation<{ review: Review }, Partial<ReviewRequest>>({
      query: (body: ReviewRequest) => ({
        url: '/review',
        method: 'POST',
        body
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
  useLazyListReviewsQuery,
  useListReviewsByBeerQuery,
  useListReviewsByBreweryQuery,
  useUpdateReviewMutation
} = reviewApi

export const { endpoints, reducerPath, reducer, middleware } = reviewApi
