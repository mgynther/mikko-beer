import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { NavMenuState as NavMenuExpandedState } from '../../core/types'

export interface NavMenuState {
  state: NavMenuExpandedState
}

export const initialState: NavMenuState = {
  state: 'COLLAPSED'
}

export const navMenuSlice = createSlice({
  name: 'navMenu',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<NavMenuExpandedState>) => {
      state.state = action.payload
    }
  }
})

export const { setState } = navMenuSlice.actions

export const selectState =
  (state: RootState): NavMenuExpandedState => state.navMenu.state

export default navMenuSlice.reducer
