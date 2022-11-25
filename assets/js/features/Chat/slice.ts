import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'chat'

interface State {
  roomId: string
  statusId: string | undefined
  onlineUsers: string[]
  onlineAt: { [id: string]: string }
}

export const initialState: State = {
  roomId: (window as any).initialState.chat.roomId,
  statusId: (window as any).initialState.chat.statusId,
  onlineUsers: [],
  onlineAt: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    syncOnline: (
      state,
      action: PayloadAction<{ id: string; onlineAt: string }[]>
    ) => {
      state.onlineUsers = action.payload.map((r) => r.id)

      for (const row of action.payload) {
        state.onlineAt[row.id] = row.onlineAt
      }
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload
    },
    setStatusId: (state, action: PayloadAction<string>) => {
      state.statusId = action.payload
    },
  },
})

export const { setRoomId, setStatusId, syncOnline } = slice.actions
export default slice.reducer
