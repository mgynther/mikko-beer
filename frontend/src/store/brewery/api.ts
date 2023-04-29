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
    listBreweries: build.query<BreweryList, void>({
      query: () => ({
        url: '/brewery',
        method: 'GET'
      }),
      providesTags: [BreweryTags.Brewery]
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
  useListBreweriesQuery
} = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
