import { emptySplitApi } from '../api'

import { UserList } from './types'

const userApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<UserList, void>({
      query: () => ({
        url: `/user`,
        method: 'GET',
      }),
    }),
  }),
})

export const { useListUsersQuery } = userApi

export const { endpoints, reducerPath, reducer, middleware } = userApi
