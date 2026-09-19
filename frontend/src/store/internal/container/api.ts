import { emptySplitApi } from '../api'

import { ReviewTags } from '../review/tags'
import { containerStatsTagTypes } from '../stats/tags'

import type { CreateContainerRequest, UpdateContainerRequest } from './requests'

import { ContainerTags } from './tags'

const containerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listContainers: build.query<unknown, void>({
      query: () => ({
        url: '/container',
        method: 'GET',
      }),
      providesTags: [ContainerTags.Container],
    }),
    createContainer: build.mutation<unknown, CreateContainerRequest>({
      query: (container: CreateContainerRequest) => ({
        url: '/container',
        method: 'POST',
        body: {
          ...container,
        },
      }),
      invalidatesTags: [ContainerTags.Container, ...containerStatsTagTypes()],
    }),
    updateContainer: build.mutation<unknown, UpdateContainerRequest>({
      query: (container: UpdateContainerRequest) => ({
        url: `/container/${container.id}`,
        method: 'PUT',
        body: {
          type: container.type,
          size: container.size,
        },
      }),
      invalidatesTags: [
        ContainerTags.Container,
        ...containerStatsTagTypes(),
        ReviewTags.Review,
      ],
    }),
  }),
})

export const {
  useCreateContainerMutation,
  useListContainersQuery,
  useUpdateContainerMutation,
} = containerApi

export const { endpoints, reducerPath, reducer, middleware } = containerApi
