import { emptySplitApi } from '../api'

import { type Pagination } from '../types'

import { type BeerWithIds, type BeerList, BeerTags } from './types'

interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

const beerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listBeers: build.query<BeerList, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/beer?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET'
      }),
      providesTags: [BeerTags.Beer]
    }),
    createBeer: build.mutation<{ beer: BeerWithIds }, Partial<BeerRequest>>({
      query: (beer: BeerRequest) => ({
        url: '/beer',
        method: 'POST',
        body: {
          ...beer
        }
      }),
      invalidatesTags: [BeerTags.Beer]
    })
  })
})

export const {
  useCreateBeerMutation,
  useLazyListBeersQuery,
  useListBeersQuery
} = beerApi

export const { endpoints, reducerPath, reducer, middleware } = beerApi
