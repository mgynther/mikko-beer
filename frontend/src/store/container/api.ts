import { emptySplitApi } from '../api'

import { containerStatsTagTypes } from '../stats/types'

import {
  type Container,
  type ContainerList,
  type ContainerRequest,
  ContainerTags
} from './types'

const containerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listContainers: build.query<ContainerList, void>({
      query: () => ({
        url: '/container',
        method: 'GET'
      }),
      providesTags: [ContainerTags.Container]
    }),
    createContainer: build.mutation<
    { container: Container },
    ContainerRequest
    >({
      query: (container: ContainerRequest) => ({
        url: '/container',
        method: 'POST',
        body: {
          ...container
        }
      }),
      invalidatesTags: [ContainerTags.Container, ...containerStatsTagTypes()]
    })
  })
})

export const {
  useCreateContainerMutation,
  useListContainersQuery
} = containerApi

export const { endpoints, reducerPath, reducer, middleware } = containerApi
