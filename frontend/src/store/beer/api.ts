import { emptySplitApi } from '../api'

import { type Beer, type BeerList, BeerTags } from './types'

interface BeerRequest {
  name: string
  breweries: string[]
  styles: string[]
}

const beerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listBeers: build.query<BeerList, void>({
      query: () => ({
        url: '/beer',
        method: 'GET'
      }),
      providesTags: [BeerTags.Beer]
    }),
    createBeer: build.mutation<{ beer: Beer }, Partial<BeerRequest>>({
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

export const { useCreateBeerMutation, useListBeersQuery } = beerApi

export const { endpoints, reducerPath, reducer, middleware } = beerApi
