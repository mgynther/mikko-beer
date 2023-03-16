import { emptySplitApi } from '../api'

import { type ReviewList } from './types'

const reviewApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listReviews: build.query<ReviewList, void>({
      query: () => ({
        url: '/review',
        method: 'GET'
      })
    })
  })
})

export const { useListReviewsQuery } = reviewApi

export const { endpoints, reducerPath, reducer, middleware } = reviewApi
