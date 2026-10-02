// Reading and dispatching against the store is one half of the binding to
// react-redux, installing it into the component tree is the other, see
// provider.ts. Together they are the only place react-redux is imported. The
// problem with reduxjs/toolkit is that it replaces a lot of react-redux but
// does not completely wrap it which makes it too easy to accidentally use
// react-redux functionality that has a better reduxjs/toolkit alternative.
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import { useDispatch as useReduxDispatch } from 'react-redux'

export { useSelector } from 'react-redux'

// Typed so that a thunk can be dispatched and what it returns comes back.
export const useDispatch: () => ThunkDispatch<unknown, unknown, UnknownAction> =
  useReduxDispatch.withTypes<ThunkDispatch<unknown, unknown, UnknownAction>>()
