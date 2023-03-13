import { emptySplitApi } from '../api'

import { ContainerList } from './types'

const containerApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listContainers: build.query<ContainerList, void>({
      query: () => ({
        url: `/container`,
        method: 'GET',
      }),
    }),
  }),
})

export const { useListContainersQuery } = containerApi

export const { endpoints, reducerPath, reducer, middleware } = containerApi
