import { emptySplitApi } from '../api'

import {
  logout,
  passwordChangeResult,
  success
} from './reducer'
import {
  type Login,
  type ChangePasswordParams,
  type LoginParams,
  type LogoutParams,
  PasswordChangeResult
} from '../../core/login/types'

const loginApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<Login, Partial<LoginParams>>({
      query: (body: LoginParams) => ({
        url: '/user/sign-in',
        method: 'POST',
        body
      }),
      async onQueryStarted (_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(success({
            user: data.user,
            authToken: data.authToken,
            refreshToken: data.refreshToken
          }))
        } catch {}
      },
      invalidatesTags: ['Login']
    }),
    changePassword: build.mutation<void, Partial<ChangePasswordParams>>({
      query: (params: ChangePasswordParams) => ({
        url: `/user/${params.userId}/change-password`,
        method: 'POST',
        body: params.body
      }),
      async onQueryStarted (_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(passwordChangeResult(PasswordChangeResult.SUCCESS))
        } catch (e) {
          dispatch(passwordChangeResult(PasswordChangeResult.ERROR))
        }
      }
    }),
    logout: build.mutation<Login, Partial<LogoutParams>>({
      query: (params: LogoutParams) => ({
        url: `/user/${params.userId}/sign-out`,
        method: 'POST',
        body: params.body
      }),
      async onQueryStarted (_, { dispatch, queryFulfilled }) {
        try {
          dispatch(logout())
          await queryFulfilled
        } catch {}
      },
      invalidatesTags: ['Login']
    })
  }),
  overrideExisting: false
})

export const {
  useChangePasswordMutation,
  useLoginMutation,
  useLogoutMutation
} = loginApi

export const { endpoints, reducerPath, reducer, middleware } = loginApi
