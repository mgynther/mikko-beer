import { configureStore } from '@reduxjs/toolkit'

import * as emptySplitApi from './api'
import loginReducer from './login/reducer'

export const store = configureStore({
  reducer: {
    login: loginReducer,
    [emptySplitApi.reducerPath]: emptySplitApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(emptySplitApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
