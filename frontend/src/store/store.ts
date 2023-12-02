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
import searchReducer from './search/reducer'
import themeReducer from './theme/reducer'

const persistConfig = {
  key: 'login',
  storage,
  whitelist: ['login', 'theme']
}

export const rootReducers = combineReducers({
  login: loginReducer,
  search: searchReducer,
  theme: themeReducer,
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
