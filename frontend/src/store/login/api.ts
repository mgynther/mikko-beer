import { emptySplitApi } from '../api'

import { type LoginState, logout, success } from './reducer'
import { type LoginParams, type LogoutParams } from './types'

const loginApi = emptySplitApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginState, Partial<LoginParams>>({
      query: (body: LoginParams) => ({
        url: '/user/sign-in',
        method: 'POST',
        body
      }),
      async onQueryStarted ({ ...patch }, { dispatch, queryFulfilled }) {
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
    logout: build.mutation<LoginState, Partial<LogoutParams>>({
      query: (params: LogoutParams) => ({
        url: `/user/${params.userId}/sign-out`,
        method: 'POST',
        body: params.body
      }),
      async onQueryStarted ({ ...patch }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logout())
        } catch {}
      },
      invalidatesTags: ['Login']
    })
  }),
  overrideExisting: false
})

export const { useLoginMutation, useLogoutMutation } = loginApi

export const { endpoints, reducerPath, reducer, middleware } = loginApi
