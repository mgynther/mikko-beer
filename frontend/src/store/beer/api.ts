import { emptySplitApi } from '../api'

import { type BeerList } from './types'

const beerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listBeers: build.query<BeerList, void>({
      query: () => ({
        url: '/beer',
        method: 'GET'
      })
    })
  })
})

export const { useListBeersQuery } = beerApi

export const { endpoints, reducerPath, reducer, middleware } = beerApi
