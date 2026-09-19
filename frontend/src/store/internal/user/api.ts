import { emptySplitApi } from '../api'

import { UserTags } from './tags'
import type { CreateUserRequest } from './requests'

const userApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<unknown, void>({
      query: () => ({
        url: '/user',
        method: 'GET',
      }),
      providesTags: [UserTags.User],
    }),
    createUser: build.mutation<unknown, Partial<CreateUserRequest>>({
      query: (params: CreateUserRequest) => ({
        url: '/user',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: [UserTags.User],
    }),
    deleteUser: build.mutation<unknown, string>({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [UserTags.User],
    }),
  }),
})

export const {
  useCreateUserMutation,
  useDeleteUserMutation,
  useListUsersQuery,
} = userApi

export const { endpoints, reducerPath, reducer, middleware } = userApi
