import { emptySplitApi } from '../api'

import {
  type Review,
  type ReviewList,
  type ReviewRequest,
  ReviewTags
} from './types'

const reviewApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listReviews: build.query<ReviewList, void>({
      query: () => ({
        url: '/review',
        method: 'GET'
      })
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

export const { useCreateReviewMutation, useListReviewsQuery } = reviewApi

export const { endpoints, reducerPath, reducer, middleware } = reviewApi
