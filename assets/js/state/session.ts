import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum Loading {
  Idle,
  Pending,
  Succeeded,
  Failed,
}

export const name = 'session'

interface State {
  id?: string
  token?: string
}

export const initialState: State = {
  id: (window as any).initialState.session.userId,
  token: (window as any).initialState.session.token,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{ id: string; token?: string }>
    ) => {
      state.id = action.payload.id
      state.token = action.payload.token
    },
  },
})

export const { setSession } = slice.actions
export default slice.reducer
