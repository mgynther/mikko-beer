import { emptySplitApi } from '../api'

import { type Pagination } from '../types'

import {
  type Beer,
  type BeerList,
  type BeerWithIds,
  BeerTags
} from './types'

interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

const beerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getBeer: build.query<{ beer: Beer }, string>({
      query: (beerId: string) => ({
        url: `/beer/${beerId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) =>
        result === undefined
          ? [BeerTags.Beer]
          : [{ type: BeerTags.Beer, id: result.beer.id }]
    }),
    listBeers: build.query<BeerList, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/beer?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET'
      }),
      providesTags: [BeerTags.Beer]
    }),
    searchBeers: build.query<BeerList, string>({
      query: (name: string) => ({
        url: '/beer/search',
        method: 'POST',
        body: {
          name
        }
      })
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
  useGetBeerQuery,
  useLazyListBeersQuery,
  useLazySearchBeersQuery,
  useListBeersQuery
} = beerApi

export const { endpoints, reducerPath, reducer, middleware } = beerApi
