import { emptySplitApi } from '../api'

import { ReviewTags } from '../review/tags'
import { StorageTags } from '../storage/tags'
import { StyleTags } from './tags'
import type { CreateStyleRequest, UpdateStyleRequest } from './requests'
import { styleStatsTagTypes } from '../stats/tags'

const styleApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    getStyle: build.query<unknown, string>({
      query: (id: string) => ({
        url: `/style/${id}`,
        method: 'GET',
      }),
      providesTags: [StyleTags.Style],
    }),
    listStyles: build.query<unknown, void>({
      query: () => ({
        url: '/style',
        method: 'GET',
      }),
      providesTags: [StyleTags.Style],
    }),
    createStyle: build.mutation<unknown, Partial<CreateStyleRequest>>({
      query: (style: CreateStyleRequest) => ({
        url: '/style',
        method: 'POST',
        body: {
          ...style,
        },
      }),
      invalidatesTags: [StyleTags.Style, ...styleStatsTagTypes()],
    }),
    updateStyle: build.mutation<unknown, UpdateStyleRequest>({
      query: (style: UpdateStyleRequest) => ({
        url: `/style/${style.id}`,
        method: 'PUT',
        body: {
          name: style.name,
          parents: style.parents,
        },
      }),
      invalidatesTags: [
        StyleTags.Style,
        ...styleStatsTagTypes(),
        ReviewTags.Review,
        StorageTags.Storage,
      ],
    }),
  }),
})

export const {
  useCreateStyleMutation,
  useGetStyleQuery,
  useListStylesQuery,
  useUpdateStyleMutation,
} = styleApi

export const { endpoints, reducerPath, reducer, middleware } = styleApi
