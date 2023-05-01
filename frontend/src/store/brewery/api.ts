import { emptySplitApi } from '../api'

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
    listBreweries: build.query<BreweryList, { skip: number, size: number }>({
      query: (pagination: { skip: number, size: number }) => ({
        url: `/brewery?size=${pagination.size}&skip=${pagination.skip}`,
        method: 'GET'
      }),
      providesTags: [BreweryTags.Brewery]
    }),
    searchBreweries: build.mutation<BreweryList, string>({
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
    })
  })
})

export const {
  useCreateBreweryMutation,
  useGetBreweryQuery,
  useLazyListBreweriesQuery,
  useListBreweriesQuery,
  useSearchBreweriesMutation
} = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
