import type { Dispatch } from '@reduxjs/toolkit'

import { clearSession } from '../session'
import { logout } from './reducer'

// Ends the session for every tab and shows this one as logged out.
export function endSession(dispatch: Dispatch): void {
  clearSession()
  dispatch(logout())
}
