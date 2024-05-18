import { emptySplitApi } from '../api'

import { ReviewTags } from '../review/types'
import { StorageTags } from '../storage/types'
import {
  type Style,
  type StyleList,
  StyleTags,
  type StyleWithParentIds,
  type StyleWithParentsAndChildren
} from './types'
import { styleStatsTagTypes } from '../stats/types'

interface StyleRequest {
  name: string
  parents: string[]
}

const styleApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getStyle: build.query<{ style: StyleWithParentsAndChildren }, string>({
      query: (id: string) => ({
        url: `/style/${id}`,
        method: 'GET'
      }),
      providesTags: [StyleTags.Style]
    }),
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
      invalidatesTags: [StyleTags.Style, ...styleStatsTagTypes()]
    }),
    updateStyle: build.mutation<{
      style: StyleWithParentIds
    }, StyleWithParentIds
    >({
      query: (style: StyleWithParentIds) => ({
        url: `/style/${style.id}`,
        method: 'PUT',
        body: {
          name: style.name,
          parents: style.parents
        }
      }),
      invalidatesTags: [
        StyleTags.Style,
        ...styleStatsTagTypes(),
        ReviewTags.Review,
        StorageTags.Storage
      ]
    })
  })
})

export const {
  useCreateStyleMutation,
  useGetStyleQuery,
  useListStylesQuery,
  useUpdateStyleMutation
} = styleApi

export const { endpoints, reducerPath, reducer, middleware } = styleApi
