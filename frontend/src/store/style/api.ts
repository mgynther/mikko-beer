import { emptySplitApi } from '../api'

import { type Style, type StyleList, StyleTags } from './types'

interface StyleRequest {
  name: string
  parents: string[]
}

const styleApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listStyles: build.query<StyleList, void>({
      query: () => ({
        url: '/style',
        method: 'GET'
      }),
      providesTags: [StyleTags.Style]
    }),
    createStyle: build.mutation<{ style: Style }, Partial<StyleRequest>>({
      query: (style: StyleRequest) => ({
        url: '/style',
        method: 'POST',
        body: {
          ...style
        }
      }),
      invalidatesTags: [StyleTags.Style]
    })
  })
})

export const { useCreateStyleMutation, useListStylesQuery } = styleApi

export const { endpoints, reducerPath, reducer, middleware } = styleApi
