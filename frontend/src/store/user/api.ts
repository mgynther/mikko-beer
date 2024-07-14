import { emptySplitApi } from '../api'

import { UserTags } from './types'
import {
  type CreateUserRequest,
  type User,
  type UserList
} from '../../core/user/types'

const userApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<UserList, void>({
      query: () => ({
        url: '/user',
        method: 'GET'
      }),
      providesTags: [UserTags.User]
    }),
    createUser: build.mutation<{ user: User }, Partial<CreateUserRequest>>({
      query: (params: CreateUserRequest) => ({
        url: '/user',
        method: 'POST',
        body: params
      }),
      invalidatesTags: [UserTags.User]
    }),
    deleteUser: build.mutation<void, Partial<string>>({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [UserTags.User]
    })
  })
})

export const {
  useCreateUserMutation,
  useDeleteUserMutation,
  useListUsersQuery
} = userApi

export const { endpoints, reducerPath, reducer, middleware } = userApi
