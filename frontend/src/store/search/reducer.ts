import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface SearchState {
  activeSearchId: string
}

const initialState: SearchState = {
  activeSearchId: ''
}

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    activate: (state, action: PayloadAction<string>) => {
      state.activeSearchId = action.payload
    }
  }
})

export const {
  activate
} = searchSlice.actions

export const selectActiveSearch = (state: RootState):
string => state.search.activeSearchId

export default searchSlice.reducer
