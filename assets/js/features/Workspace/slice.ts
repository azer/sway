import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'workspace'

interface State {
  members: { [workspaceId: string]: string[] }
}

export const initialState: State = {
  members: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setMembers: (
      state,
      action: PayloadAction<{ workspaceId: string; userIds: string[] }>
    ) => {
      state.members[action.payload.workspaceId] = action.payload.userIds
    },
    addMember: (
      state,
      action: PayloadAction<{ workspaceId: string; userId: string }>
    ) => {
      const existing = state.members[action.payload.workspaceId] || []

      state.members[action.payload.workspaceId] = [
        ...existing,
        action.payload.userId,
      ]
    },
  },
})

export const { setMembers, addMember } = slice.actions
export default slice.reducer
