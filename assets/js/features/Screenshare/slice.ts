import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'screenshare'

interface State {
  on: boolean
}

export const initialState: State = {
  on: false,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setScreenSharing: (state, action: PayloadAction<boolean>) => {
      state.on = action.payload
    },
    startScreensharing: (state, action: PayloadAction<undefined>) => {
      state.on = true
    },
    stopScreensharing: (state, action: PayloadAction<undefined>) => {
      state.on = false
    },
    toggleScreensharing: (state, action: PayloadAction<undefined>) => {
      state.on = !state.on
    },
  },
})

export const {
  setScreenSharing,
  startScreensharing,
  stopScreensharing,
  toggleScreensharing,
} = slice.actions
export default slice.reducer
