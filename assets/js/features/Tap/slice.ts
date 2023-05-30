import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { StatusModeKey } from 'state/status'

export const name = 'taps'

export interface StatusHook {
  userId: string
  whenActive?: boolean
  whenPresentAs?: StatusModeKey
}

export interface Tap {
  // id: string
  from: string
  to: string
  workspace_id: string
  room_id: string
  //inserted_at: Date
  //notified?: boolean
}

interface State {
  receivedTaps: Tap[]
  statusHooks: Record<string, StatusHook>
}

export const initialState: State = {
  receivedTaps: [],
  statusHooks: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setStatusHook: (state, action: PayloadAction<StatusHook>) => {
      if (!state.statusHooks[action.payload.userId]) {
        state.statusHooks[action.payload.userId] = action.payload
      } else {
        delete state.statusHooks[action.payload.userId]
      }
    },
    removeStatusHook: (state, action: PayloadAction<string[]>) => {
      for (const id of action.payload) {
        delete state.statusHooks[id]
      }
    },
  },
})

export const { setStatusHook, removeStatusHook } = slice.actions
export default slice.reducer
