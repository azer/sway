import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'userSocket'

interface State {
  onlineUsers: string[]
  onlineAt: { [id: string]: string }
}

export const initialState: State = {
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
  },
})

export const { syncOnline } = slice.actions
export default slice.reducer
