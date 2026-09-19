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

export interface Login {
  authToken: string
  refreshToken: string
  user: StoredUser | undefined
}

export interface Refresh {
  authToken: string
  refreshToken: string
}

export type PasswordChangeResult = 'ERROR' | 'SUCCESS' | 'UNDEFINED'

interface LoginState {
  login: Login
  passwordChangeResult: PasswordChangeResult
}

export const initialState: LoginState = {
  login: {
    user: undefined,
    authToken: '',
    refreshToken: '',
  },
  passwordChangeResult: 'UNDEFINED',
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: (state) => {
      state.login.user = undefined
      state.login.authToken = ''
      state.login.refreshToken = ''
    },
    success: (state, action: PayloadAction<Login>) => {
      state.login = action.payload
      state.passwordChangeResult = 'UNDEFINED'
    },
    refresh: (state, action: PayloadAction<Refresh>) => {
      state.login.authToken = action.payload.authToken
      state.login.refreshToken = action.payload.refreshToken
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

export const { logout, passwordChangeResult, refresh, success } =
  loginSlice.actions

export const selectLogin = (state: RootState): Login => state.login.login
export const selectPasswordChangeResult = (
  state: RootState,
): PasswordChangeResult => state.login.passwordChangeResult

export default loginSlice.reducer
