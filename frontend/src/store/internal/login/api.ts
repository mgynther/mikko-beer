import type {
  BaseQueryApi,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query/react'

import { emptySplitApi, fetchByRefreshToken } from '../api'
import { extraOf } from '../extra'
import type { StoreExtra } from '../extra'
import { readSession } from '../session'
import type { Session } from '../session-parser'

import { endSession } from './end-session'
import { passwordChangeResult } from './reducer'
import type {
  ChangePasswordParams,
  LoginParams,
  LogoutParams,
} from './requests'

type SignOutResult = QueryReturnValue<
  unknown,
  FetchBaseQueryError,
  FetchBaseQueryMeta
>

// The mutex is held throughout, so a refresh of this tab neither replaces the
// refresh token before it is sent nor writes a session back after it ended.
async function signOut(api: BaseQueryApi): Promise<SignOutResult> {
  const { fetchQuery, mutex, storage }: StoreExtra = extraOf(api.extra)
  return await mutex.runExclusive(async (): Promise<SignOutResult> => {
    const session: Session | undefined = readSession(storage)
    try {
      if (session === undefined) {
        return { data: undefined }
      }
      const params: LogoutParams = {
        userId: session.user.id,
        body: { refreshToken: session.refreshToken },
      }
      return await fetchByRefreshToken(
        fetchQuery,
        {
          url: `/user/${params.userId}/sign-out`,
          method: 'POST',
          body: params.body,
        },
        api,
      )
    } finally {
      endSession(storage, api.dispatch)
    }
  })
}

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
    logout: build.mutation<unknown, undefined>({
      queryFn: async (_, api) => await signOut(api),
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
