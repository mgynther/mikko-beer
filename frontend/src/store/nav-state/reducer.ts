import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { NavState } from '../../core/types'

export interface NavStateState {
  navState: NavState
}

export const initialState: NavStateState = {
  navState: 'COLLAPSED'
}

export const navStateSlice = createSlice({
  name: 'navState',
  initialState,
  reducers: {
    setNavState: (state, action: PayloadAction<NavState>) => {
      state.navState = action.payload
    }
  }
})

export const { setNavState } = navStateSlice.actions

export const selectNavState =
  (state: RootState): NavState => state.navState.navState

export default navStateSlice.reducer
