import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// The store's own state, declared here rather than imported from types/. The
// caller's NavMenuState satisfies it structurally and storehooks/nav-menu is
// where the two meet.
export type NavMenuExpandedState = 'COLLAPSED' | 'EXPANDED'

export interface NavMenuState {
  state: NavMenuExpandedState
}

export const initialState: NavMenuState = {
  state: 'COLLAPSED',
}

const navMenuSlice = createSlice({
  name: 'navMenu',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<NavMenuExpandedState>) => {
      state.state = action.payload
    },
  },
})

export const { setState } = navMenuSlice.actions

export const selectState = (state: RootState): NavMenuExpandedState =>
  state.navMenu.state

export default navMenuSlice.reducer
