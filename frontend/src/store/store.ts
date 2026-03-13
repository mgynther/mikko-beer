import { combineReducers, configureStore } from '@reduxjs/toolkit'

import * as emptySplitApi from './api'
import loginReducer, {
  initialState as initialLoginState
} from './login/reducer'
import searchReducer from './search/reducer'
import navStateReducer, {
  initialState as initialNavStateState
} from './nav-state/reducer'
import themeReducer, {
  initialState as initialThemeState
} from './theme/reducer'

// Very awkward legacy from redux-persist and poor judgment on selecting key.
const localStoreKey = 'persist:login'
const fullStore = JSON.parse(localStorage.getItem(localStoreKey) ?? '{}')

function asObject(value: unknown): object {
  if (value === null) {
    return {}
  }
  if (typeof value === 'object') {
    return value
  }
  // Once all clients have persisted state once this can be removed.
  if (typeof value === 'string') {
    return JSON.parse(value)
  }
  return {}
}

const persisted = {
  login: {
    ...initialLoginState,
    ...asObject(fullStore.login)
  },
  navState: {
    ...initialNavStateState,
    ...asObject(fullStore.navState)
  },
  theme: {
    ...initialThemeState,
    ...asObject(fullStore.theme)
  },
}

export const rootReducers = combineReducers({
  login: loginReducer,
  navState: navStateReducer,
  search: searchReducer,
  theme: themeReducer,
  [emptySplitApi.reducerPath]: emptySplitApi.reducer
})
export const store = configureStore({
  preloadedState: persisted,
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(emptySplitApi.middleware)
})

store.subscribe(() => {
  const fullState = store.getState();
  localStorage.setItem(localStoreKey, JSON.stringify(
    {
      login: fullState.login,
      navState: fullState.navState,
      theme: fullState.theme
    }
  ))
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
