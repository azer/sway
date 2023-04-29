import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sendMessage } from 'lib/electron'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { AppDispatch, RootState } from 'state'
import { ElectronWindow } from '.'

const log = logger('electron-tray')

export const name = 'electron-tray'

interface State {
  windowOpen: boolean
  windowCreated: boolean
}

export const initialState: State = {
  windowOpen: false,
  windowCreated: false,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setWindowOpen: (state, action: PayloadAction<boolean>) => {
      state.windowOpen = action.payload
    },
    setWindowCreated: (state, action: PayloadAction<boolean>) => {
      state.windowCreated = action.payload
    },
  },
})

export const { setWindowOpen, setWindowCreated } = slice.actions
export default slice.reducer

export function sendVideoFrame(participantId: string, frame: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const isTrayOpen = selectors.electronTray.isTrayWindowOpen(getState())
    if (!isTrayOpen) return

    log.info('Sending video frame', {
      participantId,
      frame,
    })

    sendMessage(ElectronWindow.Tray, {
      participantId,
      frame,
    })
  }
}
