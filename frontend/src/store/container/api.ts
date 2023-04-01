import { emptySplitApi } from '../api'

import { type ContainerList, ContainerTags } from './types'

const containerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listContainers: build.query<ContainerList, void>({
      query: () => ({
        url: '/container',
        method: 'GET'
      }),
      providesTags: [ContainerTags.Container]
    })
  })
})

export const { useListContainersQuery } = containerApi

export const { endpoints, reducerPath, reducer, middleware } = containerApi
