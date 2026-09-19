import { emptySplitApi } from '../api'

import type { Pagination } from '../pagination'

import { BeerTags } from '../beer/tags'
import { ReviewTags } from '../review/tags'
import { StorageTags } from '../storage/tags'
import { breweryStatsTagTypes } from '../stats/tags'

import type { CreateBreweryRequest, UpdateBreweryRequest } from './requests'
import { BreweryTags } from './tags'

const breweryApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getBrewery: build.query<unknown, string>({
      query: (breweryId: string) => ({
        url: `/brewery/${breweryId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, breweryId) => [
        { type: BreweryTags.Brewery, id: breweryId },
      ],
    }),
    listBreweries: build.query<unknown, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/brewery?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET',
      }),
      providesTags: [BreweryTags.Brewery],
    }),
    searchBreweries: build.query<unknown, string>({
      query: (name: string) => ({
        url: '/brewery/search',
        method: 'POST',
        body: {
          name,
        },
      }),
    }),
    createBrewery: build.mutation<unknown, Partial<CreateBreweryRequest>>({
      query: (brewery: CreateBreweryRequest) => ({
        url: '/brewery',
        method: 'POST',
        body: {
          name: brewery.name,
          country: brewery.country,
        },
      }),
      invalidatesTags: [BreweryTags.Brewery],
    }),
    updateBrewery: build.mutation<unknown, UpdateBreweryRequest>({
      query: (brewery: UpdateBreweryRequest) => ({
        url: `/brewery/${brewery.id}`,
        method: 'PUT',
        body: {
          name: brewery.name,
          country: brewery.country,
        },
      }),
      invalidatesTags: [
        BeerTags.Beer,
        BreweryTags.Brewery,
        ...breweryStatsTagTypes(),
        ReviewTags.Review,
        StorageTags.Storage,
      ],
    }),
  }),
})

export const {
  useCreateBreweryMutation,
  useGetBreweryQuery,
  useLazyListBreweriesQuery,
  useLazySearchBreweriesQuery,
  useUpdateBreweryMutation,
} = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
