import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateWorkspaceFocus } from 'features/Focus'
import { WorkspaceFocusRegion } from './focus'

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

export function setWorkspaceFocusRegion(region: WorkspaceFocusRegion) {
  return updateWorkspaceFocus((draft) => {
    draft.region = WorkspaceFocusRegion.Room
  })
}
