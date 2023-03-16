import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { beerTagTypes } from './beer/types'
import { breweryTagTypes } from './brewery/types'
import { containerTagTypes } from './container/types'
import { loginTagTypes } from './login/types'
import { styleTagTypes } from './style/types'
import { userTagTypes } from './user/types'

import { type RootState } from './store'

function mergeTags (): string[] {
  return [...beerTagTypes(), ...breweryTagTypes(), ...containerTagTypes(), ...loginTagTypes(), ...styleTagTypes(), ...userTagTypes()]
}

export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api/v1',
    prepareHeaders: (headers, api) => {
      const authToken = (api.getState() as RootState).login.authToken
      if (authToken?.length > 0) {
        headers.set('Authorization', `Bearer ${authToken}`)
      }
    }
  }),
  tagTypes: mergeTags(),
  endpoints: () => ({})
})

export const { reducerPath, reducer, middleware } = emptySplitApi
