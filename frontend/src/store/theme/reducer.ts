import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { Theme } from '../../core/types'

export interface ThemeState {
  theme: Theme
}

const initialState: ThemeState = {
  theme: Theme.LIGHT
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    }
  }
})

export const { setTheme } = themeSlice.actions

export const selectTheme = (state: RootState): Theme => state.theme.theme

export default themeSlice.reducer
