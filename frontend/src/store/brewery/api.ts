import { emptySplitApi } from '../api'

import { type Pagination } from '../types'
import { statsTagTypes } from '../stats/types'

import {
  type Brewery,
  type BreweryList,
  BreweryTags
} from './types'

const breweryApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getBrewery: build.query<{ brewery: Brewery }, string>({
      query: (breweryId: string) => ({
        url: `/brewery/${breweryId}`,
        method: 'GET'
      }),
      providesTags: (result, error, arg) =>
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
      invalidatesTags: [BreweryTags.Brewery, ...statsTagTypes()]
    })
  })
})

export const {
  useCreateBreweryMutation,
  useGetBreweryQuery,
  useLazyListBreweriesQuery,
  useLazySearchBreweriesQuery,
  useListBreweriesQuery
} = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
