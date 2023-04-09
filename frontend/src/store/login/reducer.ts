import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { User } from '../user/types'

export interface Refresh {
  authToken: string
  refreshToken: string
}

export interface Login extends Refresh {
  user: User | undefined
}

export enum PasswordChangeResult {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  UNDEFINED = 'UNDEFINED'
}

export interface LoginState {
  login: Login
  passwordChangeResult: PasswordChangeResult
}

const initialState: LoginState = {
  login: {
    user: undefined,
    authToken: '',
    refreshToken: ''
  },
  passwordChangeResult: PasswordChangeResult.UNDEFINED
}

export const loginSlice = createSlice({
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
      state.passwordChangeResult = PasswordChangeResult.UNDEFINED
    },
    refresh: (state, action: PayloadAction<Refresh>) => {
      state.login.authToken = action.payload.authToken
      state.login.refreshToken = action.payload.refreshToken
      state.passwordChangeResult = PasswordChangeResult.UNDEFINED
    },
    passwordChangeResult: (
      state, action: PayloadAction<PasswordChangeResult>
    ) => {
      state.passwordChangeResult = action.payload
    }
  }
})

export const {
  logout,
  passwordChangeResult,
  refresh,
  success
} = loginSlice.actions

export const selectLogin = (state: RootState): Login => state.login.login
export const selectPasswordChangeResult =
  (state: RootState): PasswordChangeResult =>
    state.login.passwordChangeResult

export default loginSlice.reducer
