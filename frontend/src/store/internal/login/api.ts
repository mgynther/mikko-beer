import { emptySplitApi } from '../api'

import { logout, passwordChangeResult } from './reducer'
import type {
  ChangePasswordParams,
  LoginParams,
  LogoutParams,
} from './requests'

const loginApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    // The response is dispatched by the storehook, which is where it can be
    // validated first. The store would have to trust it.
    login: build.mutation<unknown, Partial<LoginParams>>({
      query: (body: LoginParams) => ({
        url: '/user/sign-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Login'],
    }),
    changePassword: build.mutation<unknown, Partial<ChangePasswordParams>>({
      query: (params: ChangePasswordParams) => ({
        url: `/user/${params.userId}/change-password`,
        method: 'POST',
        body: params.body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(passwordChangeResult('SUCCESS'))
        } catch (_) {
          dispatch(passwordChangeResult('ERROR'))
        }
      },
    }),
    logout: build.mutation<unknown, Partial<LogoutParams>>({
      query: (params: LogoutParams) => ({
        url: `/user/${params.userId}/sign-out`,
        method: 'POST',
        body: params.body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          dispatch(logout())
        }
      },
      invalidatesTags: ['Login'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useChangePasswordMutation,
  useLoginMutation,
  useLogoutMutation,
} = loginApi

export const { endpoints, reducerPath, reducer, middleware } = loginApi
