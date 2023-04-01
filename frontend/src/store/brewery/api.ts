import { emptySplitApi } from '../api'

import {
  type Brewery,
  type BreweryList,
  BreweryTags
} from './types'

const breweryApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
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

export const { useCreateBreweryMutation, useListBreweriesQuery } = breweryApi

export const { endpoints, reducerPath, reducer, middleware } = breweryApi
