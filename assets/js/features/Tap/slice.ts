import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PresenceStatus } from 'state/presence'

export const name = 'taps'

export interface StatusHook {
  userId: string
  whenActive?: boolean
  whenPresentAs?: PresenceStatus
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
      state.statusHooks[action.payload.userId] = action.payload
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
