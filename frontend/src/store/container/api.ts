import { emptySplitApi } from '../api'

import { ReviewTags } from '../review/types'
import { containerStatsTagTypes } from '../stats/types'

import type {
  Container,
  ContainerList,
  ContainerRequest,
} from '../../core/container/types'

import {
  ContainerTags
} from './types'

const containerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type --
     * Void required here to generate correct hook.
     */
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
    }),
    updateContainer: build.mutation<{ container: Container }, Container>({
      query: (container: Container) => ({
        url: `/container/${container.id}`,
        method: 'PUT',
        body: {
          type: container.type,
          size: container.size
        }
      }),
      invalidatesTags: [
        ContainerTags.Container,
        ...containerStatsTagTypes(),
        ReviewTags.Review
      ]
    })
  })
})

export const {
  useCreateContainerMutation,
  useListContainersQuery,
  useUpdateContainerMutation
} = containerApi

export const { endpoints, reducerPath, reducer, middleware } = containerApi
