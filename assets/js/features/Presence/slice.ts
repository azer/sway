import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'presence'

interface State {
  online: string[]
  lastSeenAt: { [id: string]: string }
}

export const initialState: State = {
  online: [],
  lastSeenAt: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    update: (
      state,
      action: PayloadAction<{ id: string; lastSeenAt: string }[]>
    ) => {
      state.online = action.payload.map((r) => r.id)
      for (const row of action.payload) {
        state.lastSeenAt[row.id] = row.lastSeenAt
      }
    },
  },
})

export const { update } = slice.actions
export default slice.reducer
