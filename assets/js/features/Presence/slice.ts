import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'presence'

interface State {
  userStatuses: { [userId: string]: string }
}

export const initialState: State = {
  // @ts-ignore
  userStatuses: window.initialState?.status || {},
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
