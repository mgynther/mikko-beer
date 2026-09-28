import { combineReducers, configureStore } from '@reduxjs/toolkit'

import * as emptySplitApi from './api'
import loginReducer, {
  initialState as initialLoginState,
} from './login/reducer'
import searchReducer from './search/reducer'
import navMenuReducer, {
  initialState as initialNavMenuState,
} from './nav-menu/reducer'
import themeReducer, {
  initialState as initialThemeState,
} from './theme/reducer'
import { asObject } from './localstorage-member-parser'
import { readSession } from './session'

const localStoreKey = 'mikkobeer-persisted'
const fullStore = JSON.parse(localStorage.getItem(localStoreKey) ?? '{}')

// The user is kept in the state as well as in the session because the
// components are rendered from the state. The tokens are not, see session.ts.
const persisted = {
  login: {
    ...initialLoginState,
    login: {
      user: readSession()?.user,
    },
  },
  navMenu: {
    ...initialNavMenuState,
    ...asObject(fullStore.navMenu),
  },
  theme: {
    ...initialThemeState,
    ...asObject(fullStore.theme),
  },
}

const rootReducers = combineReducers({
  login: loginReducer,
  navMenu: navMenuReducer,
  search: searchReducer,
  theme: themeReducer,
  [emptySplitApi.reducerPath]: emptySplitApi.reducer,
})
export const store = configureStore({
  preloadedState: persisted,
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(emptySplitApi.middleware),
})

store.subscribe(() => {
  const fullState = store.getState()
  localStorage.setItem(
    localStoreKey,
    JSON.stringify({
      navMenu: fullState.navMenu,
      theme: fullState.theme,
    }),
  )
})

export type RootState = ReturnType<typeof store.getState>
