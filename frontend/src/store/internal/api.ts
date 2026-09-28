import {
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
  type QueryReturnValue,
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
import { endSession } from './login/end-session'
import { afterFailedRefresh, afterUnauthorized } from './reauthorization'
import type { AfterFailedRefresh, AfterUnauthorized } from './reauthorization'
import { parseRefresh } from './refresh-parser'
import type { Refresh } from './refresh-parser'
import { waitForTurn } from './request-blocker'
import { readSession, writeSession } from './session'
import type { Session } from './session-parser'

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

// The auth token a request is sent with travels in extraOptions rather than
// being read from the session in prepareHeaders, so that what a failure is
// compared against afterwards is exactly what was sent.
interface AuthorizedOptions {
  authToken: string
}

function authorizedBy(session: Session | undefined): AuthorizedOptions {
  return { authToken: session?.authToken ?? '' }
}

type Result = QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({
  baseUrl: `${backendUrl}/api/v1`,
  prepareHeaders: (headers, api) => {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
     * Unknown in the rtk types. Every call of baseQuery here passes
     * AuthorizedOptions.
     */
    const { authToken } = api.extraOptions as AuthorizedOptions
    if (authToken.length > 0) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }
  },
})

async function refresh(
  session: Session,
  api: BaseQueryApi,
): Promise<Refresh | undefined> {
  const refreshResult = await baseQuery(
    {
      method: 'POST',
      url: `/user/${session.user.id}/refresh`,
      body: { refreshToken: session.refreshToken },
    },
    api,
    authorizedBy(undefined),
  )
  return parseRefresh(refreshResult.data)
}

// Answers a request that was answered 401 with the result the caller gets:
// a retried request's, or the 401 itself once the session has ended.
async function reauthorize(
  args: string | FetchArgs,
  api: BaseQueryApi,
  sentAuthToken: string,
  unauthorized: Result,
): Promise<Result> {
  const afterRequest: AfterUnauthorized = afterUnauthorized(
    sentAuthToken,
    readSession(),
  )
  if (afterRequest.next === 'logout') {
    endSession(api.dispatch)
    return unauthorized
  }
  if (afterRequest.next === 'retry') {
    return await baseQuery(args, api, authorizedBy(afterRequest.session))
  }
  const session: Session = afterRequest.session
  const refreshed: Refresh | undefined = await refresh(session, api)
  if (refreshed !== undefined) {
    const refreshedSession: Session = {
      authToken: refreshed.authToken,
      refreshToken: refreshed.refreshToken,
      user: session.user,
    }
    writeSession(refreshedSession)
    return await baseQuery(args, api, authorizedBy(refreshedSession))
  }
  const afterRefresh: AfterFailedRefresh = afterFailedRefresh(
    session.refreshToken,
    readSession(),
  )
  if (afterRefresh.next === 'logout') {
    endSession(api.dispatch)
    return unauthorized
  }
  return await baseQuery(args, api, authorizedBy(afterRefresh.session))
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api) => {
  await mutex.waitForUnlock()
  const sent: Session | undefined = readSession()
  let result: Result = await baseQuery(args, api, authorizedBy(sent))
  if (result.error?.status === 401) {
    const unauthorized: Result = result
    await waitForTurn(mutex, async () => {
      result = await reauthorize(args, api, sent?.authToken ?? '', unauthorized)
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
