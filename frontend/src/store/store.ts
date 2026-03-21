import { combineReducers, configureStore } from '@reduxjs/toolkit'

import * as emptySplitApi from './api'
import loginReducer, {
  initialState as initialLoginState
} from './login/reducer'
import searchReducer from './search/reducer'
import navMenuReducer, {
  initialState as initialNavMenuState
} from './nav-menu/reducer'
import themeReducer, {
  initialState as initialThemeState
} from './theme/reducer'

const localStoreKey = 'mikkobeer-persisted'
const fullStore = JSON.parse(localStorage.getItem(localStoreKey) ?? '{}')

function asObject(value: unknown): object {
  if (value === null) {
    return {}
  }
  if (typeof value === 'object') {
    return value
  }
  return {}
}

const persisted = {
  login: {
    ...initialLoginState,
    ...asObject(fullStore.login)
  },
  navMenu: {
    ...initialNavMenuState,
    ...asObject(fullStore.navMenu)
  },
  theme: {
    ...initialThemeState,
    ...asObject(fullStore.theme)
  },
}

export const rootReducers = combineReducers({
  login: loginReducer,
  navMenu: navMenuReducer,
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
      navMenu: fullState.navMenu,
      theme: fullState.theme
    }
  ))
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
