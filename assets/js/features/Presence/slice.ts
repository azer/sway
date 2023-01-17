import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PresenceMode } from 'state/entities'

export const name = 'presence'
export const DefaultPresenceMode = PresenceMode.Focus

interface State {
  userStatuses: { [userId: string]: string }
}

export const initialState: State = {
  userStatuses: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setStatusId: (
      state,
      action: PayloadAction<{ userId: string; statusId: string }>
    ) => {
      state.userStatuses[action.payload.userId] = action.payload.statusId
    },
  },
})

export const { setStatusId } = slice.actions
export default slice.reducer
