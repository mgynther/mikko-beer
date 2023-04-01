import { emptySplitApi } from '../api'

import { type User, type UserList, UserTags } from './types'

interface CreateUserParams {
  user: {
    role: string
  }
  passwordSignInMethod: {
    username: string
    password: string
  }
}

const userApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<UserList, void>({
      query: () => ({
        url: '/user',
        method: 'GET'
      }),
      providesTags: [UserTags.User]
    }),
    createUser: build.mutation<{ user: User }, Partial<CreateUserParams>>({
      query: (params: CreateUserParams) => ({
        url: '/user',
        method: 'POST',
        body: params
      }),
      invalidatesTags: [UserTags.User]
    })
  })
})

export const { useCreateUserMutation, useListUsersQuery } = userApi

export const { endpoints, reducerPath, reducer, middleware } = userApi
