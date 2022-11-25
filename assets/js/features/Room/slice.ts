import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateShellFocus } from 'features/Focus'

export const name = 'room'

interface State {
  users: { [id: string]: string[] }
  orgRoomIds: string[]
}

export const initialState: State = {
  users: {},
  orgRoomIds: (window as any).initialState.room.orgRoomIds || [],
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    syncRoomUsers: (
      state,
      action: PayloadAction<{ roomId: string; users: string[] }>
    ) => {
      state.users[action.payload.roomId] = action.payload.users
    },
    syncAllRoomUsers: (
      state,
      action: PayloadAction<{ [id: string]: string[] }>
    ) => {
      state.users = action.payload
    },
  },
})

export const { syncRoomUsers, syncAllRoomUsers } = slice.actions
export default slice.reducer

export function setRoomId(id: string) {
  return updateShellFocus((focus) => {
    focus.center.room.roomId = id
  })
}
