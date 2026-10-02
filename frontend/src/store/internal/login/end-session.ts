import type { Dispatch } from '@reduxjs/toolkit'

import type { WebStorage } from '../../web-storage'
import { clearSession } from '../session'
import { logout } from './reducer'

// Ends the session for every tab and shows this one as logged out.
export function endSession(storage: WebStorage, dispatch: Dispatch): void {
  clearSession(storage)
  dispatch(logout())
}
