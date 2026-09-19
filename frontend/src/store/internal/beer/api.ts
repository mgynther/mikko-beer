import { emptySplitApi } from '../api'

import type { Pagination } from '../pagination'
import { ReviewTags } from '../review/tags'
import { StorageTags } from '../storage/tags'
import { beerStatsTagTypes } from '../stats/tags'

import { BeerTags } from './tags'
import type { CreateBeerRequest, UpdateBeerRequest } from './requests'

const beerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getBeer: build.query<unknown, string>({
      query: (beerId: string) => ({
        url: `/beer/${beerId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, beerId) => [
        { type: BeerTags.Beer, id: beerId },
      ],
    }),
    listBeers: build.query<unknown, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/beer?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET',
      }),
      providesTags: [BeerTags.Beer],
    }),
    searchBeers: build.query<unknown, string>({
      query: (name: string) => ({
        url: '/beer/search',
        method: 'POST',
        body: {
          name,
        },
      }),
    }),
    createBeer: build.mutation<unknown, Partial<CreateBeerRequest>>({
      query: (beer: CreateBeerRequest) => ({
        url: '/beer',
        method: 'POST',
        body: {
          ...beer,
        },
      }),
      invalidatesTags: [
        BeerTags.Beer,
        ...beerStatsTagTypes(),
        StorageTags.Storage,
      ],
    }),
    updateBeer: build.mutation<unknown, UpdateBeerRequest>({
      query: (beer: UpdateBeerRequest) => ({
        url: `/beer/${beer.id}`,
        method: 'PUT',
        body: {
          name: beer.name,
          breweries: beer.breweries,
          styles: beer.styles,
        },
      }),
      invalidatesTags: [
        BeerTags.Beer,
        ...beerStatsTagTypes(),
        ReviewTags.Review,
        StorageTags.Storage,
      ],
    }),
  }),
})

export const {
  useCreateBeerMutation,
  useGetBeerQuery,
  useLazyListBeersQuery,
  useLazySearchBeersQuery,
  useUpdateBeerMutation,
} = beerApi

export const { endpoints, reducerPath, reducer, middleware } = beerApi
