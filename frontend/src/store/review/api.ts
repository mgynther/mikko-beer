import { emptySplitApi } from '../api'

import {
  type Review,
  type ReviewList,
  type ReviewRequest,
  ReviewTags
} from './types'

const reviewApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    // Not really a mutation but mutation has much cleaner API for fetching
    // from an event handler.
    getReview: build.mutation<{ review: Review }, string>({
      query: (id: string) => ({
        url: `/review/${id}`,
        method: 'GET'
      })
    }),
    listReviews: build.query<ReviewList, void>({
      query: () => ({
        url: '/review',
        method: 'GET'
      }),
      providesTags: [ReviewTags.Review]
    }),
    createReview: build.mutation<Review, Partial<ReviewRequest>>({
      query: (body: ReviewRequest) => ({
        url: '/review',
        method: 'POST',
        body
      }),
      invalidatesTags: [ReviewTags.Review]
    })
  })
})

export const {
  useCreateReviewMutation,
  useGetReviewMutation,
  useListReviewsQuery
} = reviewApi

export const { endpoints, reducerPath, reducer, middleware } = reviewApi
