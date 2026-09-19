import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// The store's own state, declared here rather than imported from types/. The
// caller's Theme satisfies it structurally and storehooks/theme is where the
// two meet.
export type Theme = 'LIGHT' | 'DARK'

interface ThemeState {
  theme: Theme
}

export const initialState: ThemeState = {
  theme: 'LIGHT',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    },
  },
})

export const { setTheme } = themeSlice.actions

export const selectTheme = (state: RootState): Theme => state.theme.theme

export default themeSlice.reducer
