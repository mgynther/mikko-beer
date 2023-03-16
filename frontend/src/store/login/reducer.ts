import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface User {
  id: string
  username: string
}

export interface LoginState {
  user: User | undefined
  authToken: string
  refreshToken: string
}

const initialState: LoginState = {
  user: undefined,
  authToken: '',
  refreshToken: ''
}

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = undefined
      state.authToken = ''
      state.refreshToken = ''
    },
    success: (state, action: PayloadAction<LoginState>) => {
      state.user = action.payload.user
      state.authToken = action.payload.authToken
      state.refreshToken = action.payload.refreshToken
    }
  }
})

export const { logout, success } = loginSlice.actions

export const selectLogin = (state: RootState): LoginState => state.login

export default loginSlice.reducer
