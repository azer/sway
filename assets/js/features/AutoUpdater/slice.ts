import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'auto-updater'

export interface Release {
  name: string
  notes: string
}

interface State {
  newRelease: Release | null
}

export const initialState: State = {
  newRelease: null,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setNewRelease: (state, action: PayloadAction<Release>) => {
      state.newRelease = action.payload
    },
  },
})

export const { setNewRelease } = slice.actions
export default slice.reducer
