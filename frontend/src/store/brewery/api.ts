import { emptySplitApi } from '../api'

import { type Pagination } from '../../core/types'

import { BeerTags } from '../beer/types'
import { ReviewTags } from '../review/types'
import { StorageTags } from '../storage/types'
import { breweryStatsTagTypes } from '../stats/types'

import { type Brewery, type BreweryList } from '../../core/brewery/types'
import { BreweryTags } from './types'

const breweryApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getBrewery: build.query<{ brewery: Brewery }, string>({
      query: (breweryId: string) => ({
        url: `/brewery/${breweryId}`,
        method: 'GET'
      }),
      providesTags: (result) =>
        result === undefined
          ? [BreweryTags.Brewery]
          : [{ type: BreweryTags.Brewery, id: result.brewery.id }]
    }),
    listBreweries: build.query<BreweryList, Pagination>({
      query: (pagination: Pagination) => ({
        url: `/brewery?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET'
      }),
      providesTags: [BreweryTags.Brewery]
    }),
    searchBreweries: build.query<BreweryList, string>({
      query: (name: string) => ({
        url: '/brewery/search',
        method: 'POST',
        body: {
          name
        }
      })
    }),
    createBrewery: build.mutation<{ brewery: Brewery }, Partial<string>>({
      query: (name: string) => ({
        url: '/brewery',
        method: 'POST',
        body: {
          name
        }
      }),
      invalidatesTags: [BreweryTags.Brewery]
    }),
    updateBrewery: build.mutation<{ brewery: Brewery }, Brewery>({
      query: (brewery: Brewery) => ({
        url: `/brewery/${brewery.id}`,
        method: 'PUT',
        body: {
          name: brewery.name
        }
      }),
      invalidatesTags: [
        BeerTags.Beer,
        BreweryTags.Brewery,
        ...breweryStatsTagTypes(),
        ReviewTags.Review,
        StorageTags.Storage
      ]
    })
  })
})

export const {
  useCreateBreweryMutation,
  useGetBreweryQuery,
  useLazyListBreweriesQuery,
  useLazySearchBreweriesQuery,
  useListBreweriesQuery,
  useUpdateBreweryMutation
} = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
