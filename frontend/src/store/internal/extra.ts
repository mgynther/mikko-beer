import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit'
import type { Mutex } from 'async-mutex'

import type { WebStorage } from '../web-storage'
import type { FetchQuery } from './api'

// What a store gives the requests made through it and its own thunks, as the
// extra argument of its thunks. All of it is the store's rather than the
// module's: the mutex keeps one refresh or sign-out at a time, and a store is
// what a browser tab has one of; the fetch query talks to the backend the
// store was created for; and the storage is where the session and the
// settings live.
export interface StoreExtra {
  mutex: Mutex
  fetchQuery: FetchQuery
  storage: WebStorage
}

export function extraOf(extra: unknown): StoreExtra {
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion --
   * Unknown in the rtk types. createStore gives every store a StoreExtra.
   */
  return extra as StoreExtra
}

// The storage of the store it is dispatched to, for the hooks of the store
// that have no other way to it.
export const storageOf: ThunkAction<
  WebStorage,
  unknown,
  unknown,
  UnknownAction
> = (_dispatch, _getState, extra): WebStorage => extraOf(extra).storage
