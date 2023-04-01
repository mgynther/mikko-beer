import { combineReducers, configureStore } from '@reduxjs/toolkit'

import storage from 'redux-persist/lib/storage'
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'

import * as emptySplitApi from './api'
import loginReducer from './login/reducer'

const persistConfig = {
  key: 'login',
  storage,
  whitelist: ['login']
}

export const rootReducers = combineReducers({
  login: loginReducer,
  [emptySplitApi.reducerPath]: emptySplitApi.reducer
})
const persistedReducer = persistReducer(persistConfig, rootReducers)
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(emptySplitApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
