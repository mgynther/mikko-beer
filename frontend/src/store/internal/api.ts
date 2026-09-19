import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { beerTagTypes } from './beer/tags'
import { breweryTagTypes } from './brewery/tags'
import { containerTagTypes } from './container/tags'
import { locationTagTypes } from './location/tags'
import { loginTagTypes } from './login/tags'
import { reviewTagTypes } from './review/tags'
import { allStatsTagTypes } from './stats/tags'
import { styleTagTypes } from './style/tags'
import { userTagTypes } from './user/tags'

import { backendUrl } from './config/constants'
import { waitForTurn } from './request-blocker'
import { parseAuthToken, parseRefreshDetails } from './refresh-details-parser'
import { parseRefresh } from './refresh-parser'

function mergeTags(): string[] {
  return [
    ...allStatsTagTypes(),
    ...beerTagTypes(),
    ...breweryTagTypes(),
    ...containerTagTypes(),
    ...locationTagTypes(),
    ...loginTagTypes(),
    ...reviewTagTypes(),
    ...styleTagTypes(),
    ...userTagTypes(),
  ]
}

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({
  baseUrl: `${backendUrl}/api/v1`,
  prepareHeaders: (headers, api) => {
    const authToken = parseAuthToken(api.getState())
    if (authToken.length > 0) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }
  },
})
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    await waitForTurn(mutex, async () => {
      const { userId, refreshToken } = parseRefreshDetails(api.getState())
      const refreshResult = await baseQuery(
        {
          method: 'POST',
          url: `/user/${userId}/refresh`,
          body: { refreshToken },
        },
        api,
        extraOptions,
      )
      const refresh = parseRefresh(refreshResult.data)
      if (refresh === undefined) {
        api.dispatch({ type: 'login/logout' })
      } else {
        api.dispatch({
          type: 'login/refresh',
          payload: refresh,
        })
        result = await baseQuery(args, api, extraOptions)
      }
    })
  }
  return result
}

export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: mergeTags(),
  endpoints: () => ({}),
})

export const { reducerPath, reducer, middleware } = emptySplitApi
