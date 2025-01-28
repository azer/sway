import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'user_management'

interface State {
  usersByWorkspaceId: { [workspaceId: string]: string[] }
}

export const initialState: State = {
  usersByWorkspaceId: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setUsersByWorkspaceId: (
      state,
      action: PayloadAction<{ workspaceId: string; userIds: string[] }>
    ) => {
      state.usersByWorkspaceId[action.payload.workspaceId] =
        action.payload.userIds
    },
  },
})

export const { setUsersByWorkspaceId } = slice.actions
export default slice.reducer
