import { emptySplitApi } from '../api'

import { StyleList } from './types'

const styleApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listStyles: build.query<StyleList, void>({
      query: () => ({
        url: `/style`,
        method: 'GET',
      }),
    }),
  }),
})

export const { useListStylesQuery } = styleApi

export const { endpoints, reducerPath, reducer, middleware } = styleApi
