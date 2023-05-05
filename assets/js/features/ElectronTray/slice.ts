import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sendMessage } from 'lib/electron'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { AppDispatch, RootState } from 'state'

const log = logger('electron-tray')

export const name = 'electron-tray'

interface State {
  trayOpen: boolean
  trayCreated: boolean
  pipOpen: boolean
}

export const initialState: State = {
  trayOpen: false,
  trayCreated: false,
  pipOpen: false,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setTrayOpen: (state, action: PayloadAction<boolean>) => {
      state.trayOpen = action.payload
    },
    setPipOpen: (state, action: PayloadAction<boolean>) => {
      state.pipOpen = action.payload
    },
    setTrayCreated: (state, action: PayloadAction<boolean>) => {
      state.trayCreated = action.payload
    },
  },
})

export const { setTrayOpen, setTrayCreated, setPipOpen } = slice.actions
export default slice.reducer
