import { emptySplitApi } from '../api'

import { type BreweryList } from './types'

const breweryApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listBreweries: build.query<BreweryList, void>({
      query: () => ({
        url: '/brewery',
        method: 'GET'
      })
    })
  })
})

export const { useListBreweriesQuery } = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
