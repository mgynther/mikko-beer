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

import { type RootState } from './store'

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
    const authToken = (api.getState() as RootState).login.login.authToken
    if (authToken?.length > 0) {
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
  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const userId: string =
          (api.getState() as any)?.login?.login?.user?.id ?? ''
        const refreshToken: string =
          (api.getState() as any)?.login?.login?.refreshToken ?? ''
        const refreshResult = await baseQuery(
          {
            method: 'POST',
            url: `/user/${userId}/refresh`,
            body: { refreshToken }
          },
          api,
          extraOptions
        )
        if (refreshResult.data !== undefined) {
          api.dispatch({
            type: 'login/refresh',
            payload: refreshResult.data
          })
          result = await baseQuery(args, api, extraOptions)
        } else {
          api.dispatch({ type: 'login/logout' })
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}

export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: mergeTags(),
  endpoints: () => ({})
})

export const { reducerPath, reducer, middleware } = emptySplitApi
