import { emptySplitApi } from '../api'

import { UserTags } from './types'
import type {
  CreateUserRequest,
  User,
  UserList
} from '../../core/user/types'

const userApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type --
     * Void required here to generate correct hook.
     */
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
    deleteUser: build.mutation<undefined, Partial<string>>({
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
