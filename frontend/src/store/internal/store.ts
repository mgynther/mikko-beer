import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { Store } from '@reduxjs/toolkit'
import { Mutex } from 'async-mutex'

import type { WebStorage } from '../web-storage'

import * as emptySplitApi from './api'
import type { StoreExtra } from './extra'
import loginReducer, {
  initialState as initialLoginState,
} from './login/reducer'
import searchReducer from './search/reducer'
import navMenuReducer from './nav-menu/reducer'
import themeReducer from './theme/reducer'
import { parsePersisted } from './persisted-parser'
import { readSession } from './session'

const settingsKey = 'mikkobeer-persisted'

const rootReducers = combineReducers({
  login: loginReducer,
  navMenu: navMenuReducer,
  search: searchReducer,
  theme: themeReducer,
  [emptySplitApi.reducerPath]: emptySplitApi.reducer,
})

export type RootState = ReturnType<typeof rootReducers>

// What is persisted is read when a store is created, so a store starts from
// what its storage holds at that moment.
export function createStore(
  backendUrl: string,
  storage: WebStorage,
): Store<RootState> {
  const settings = parsePersisted(storage.getItem(settingsKey))
  // The user is kept in the state as well as in the session because the
  // components are rendered from the state. The tokens are not, see
  // session.ts.
  const persisted = {
    login: {
      ...initialLoginState,
      login: {
        user: readSession(storage)?.user,
      },
    },
    navMenu: settings.navMenu,
    theme: settings.theme,
  }
  const extra: StoreExtra = {
    mutex: new Mutex(),
    fetchQuery: emptySplitApi.createFetchQuery(backendUrl),
    storage,
  }
  const store = configureStore({
    preloadedState: persisted,
    reducer: rootReducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: extra } }).concat(
        emptySplitApi.middleware,
      ),
  })
  store.subscribe(() => {
    const fullState: RootState = store.getState()
    storage.setItem(
      settingsKey,
      JSON.stringify({
        navMenu: fullState.navMenu,
        theme: fullState.theme,
      }),
    )
  })
  return store
}
