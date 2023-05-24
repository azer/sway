import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'auto-updater'

export interface Release {
  name: string
  notes: string
}

interface State {
  newRelease: Release | null
  lastRefreshedAt: number
}

export const initialState: State = {
  newRelease: null,
  lastRefreshedAt: 0,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setNewRelease: (state, action: PayloadAction<Release>) => {
      state.newRelease = action.payload
    },
    setLastRefreshedAt: (state, action: PayloadAction<number>) => {
      state.lastRefreshedAt = action.payload
    },
  },
})

export const { setNewRelease, setLastRefreshedAt } = slice.actions
export default slice.reducer
