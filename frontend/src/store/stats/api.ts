import { emptySplitApi } from '../api'

import { type Stats, statsTagTypes } from './types'

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getStats: build.query<{ stats: Stats }, void>({
      query: () => ({
        url: '/stats',
        method: 'GET'
      }),
      providesTags: statsTagTypes()
    })
  })
})

export const { useGetStatsQuery } = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
