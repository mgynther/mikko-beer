import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// The state the store keeps about the session. Declared here rather than
// imported from types/ because this is the store's own state: what a caller
// puts in has been validated by the validation layer, and what comes out is
// validated again by the storehook that reads it.
interface StoredUser {
  id: string
  username: string
  role: string
}

// The tokens are not here: they are in the session, see session.ts, and the
// store keeps only what the components are rendered from.
interface StoredLogin {
  user: StoredUser | undefined
}

export type PasswordChangeResult = 'ERROR' | 'SUCCESS' | 'UNDEFINED'

interface LoginState {
  login: StoredLogin
  passwordChangeResult: PasswordChangeResult
}

export const initialState: LoginState = {
  login: {
    user: undefined,
  },
  passwordChangeResult: 'UNDEFINED',
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: (state) => {
      state.login.user = undefined
    },
    // The result of a password change is about the session it was made in,
    // so a new sign-in starts without one.
    success: (state, action: PayloadAction<StoredUser>) => {
      state.login.user = action.payload
      state.passwordChangeResult = 'UNDEFINED'
    },
    passwordChangeResult: (
      state,
      action: PayloadAction<PasswordChangeResult>,
    ) => {
      state.passwordChangeResult = action.payload
    },
  },
})

export const { logout, passwordChangeResult, success } = loginSlice.actions

export const selectLogin = (state: RootState): StoredLogin => state.login.login
export const selectPasswordChangeResult = (
  state: RootState,
): PasswordChangeResult => state.login.passwordChangeResult

export default loginSlice.reducer
