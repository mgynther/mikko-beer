import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { beerTagTypes } from './beer/types'
import { breweryTagTypes } from './brewery/types'
import { containerTagTypes } from './container/types'
import { loginTagTypes } from './login/types'
import { allStatsTagTypes } from './stats/types'
import { styleTagTypes } from './style/types'
import { userTagTypes } from './user/types'

import type { RootState } from './store'

import { backendUrl } from '../constants'

function mergeTags (): string[] {
  return [
    ...allStatsTagTypes(),
    ...beerTagTypes(),
    ...breweryTagTypes(),
    ...containerTagTypes(),
    ...loginTagTypes(),
    ...styleTagTypes(),
    ...userTagTypes()
  ]
}

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({
  baseUrl: `${backendUrl}/api/v1`,
  prepareHeaders: (headers, api) => {
    const authToken =
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
       * Unknown in the rtk types.
       */
      (api.getState() as (RootState | undefined))?.login.login.authToken ?? ''
    if (authToken.length > 0) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }
  }
})
const baseQueryWithReauth: BaseQueryFn<
string | FetchArgs,
unknown,
FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    if (mutex.isLocked()) {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    } else {
      const release = await mutex.acquire()
      try {
        const {userId, refreshToken} = parseRefreshDetails(api.getState())
        const refreshResult = await baseQuery(
          {
            method: 'POST',
            url: `/user/${userId}/refresh`,
            body: { refreshToken }
          },
          api,
          extraOptions
        )
        if (refreshResult.data === undefined) {
          api.dispatch({ type: 'login/logout' })
        } else {
          api.dispatch({
            type: 'login/refresh',
            payload: refreshResult.data
          })
          result = await baseQuery(args, api, extraOptions)
        }
      } finally {
        release()
      }
    }
  }
  return result
}

interface RefreshDetails {
  userId: string
  refreshToken: string
}

function parseRefreshDetails (state: unknown): RefreshDetails {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Unknown in the rtk types.
   */
  const rootState = state as (RootState | undefined)
  const userId: string = rootState?.login.login.user?.id ?? ''
  const refreshToken: string = rootState?.login.login.refreshToken ?? ''
  return {
    userId,
    refreshToken
  }
}

export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: mergeTags(),
  endpoints: () => ({})
})

export const { reducerPath, reducer, middleware } = emptySplitApi
