import { emptySplitApi } from '../api'

import {
  type AnnualStats,
  type OverallStats,
  type StyleStats,
  StatsTags
} from './types'

const statsApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getAnnual: build.query<AnnualStats, void>({
      query: () => ({
        url: '/stats/annual',
        method: 'GET'
      }),
      providesTags: [StatsTags.Annual]
    }),
    getOverall: build.query<{ overall: OverallStats }, void>({
      query: () => ({
        url: '/stats/overall',
        method: 'GET'
      }),
      providesTags: [StatsTags.Overall]
    }),
    getStyle: build.query<StyleStats, void>({
      query: () => ({
        url: '/stats/style',
        method: 'GET'
      }),
      providesTags: [StatsTags.Style]
    })
  })
})

export const {
  useGetAnnualQuery,
  useGetOverallQuery,
  useGetStyleQuery
} = statsApi

export const { endpoints, reducerPath, reducer, middleware } = statsApi
