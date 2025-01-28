import selectors from 'selectors'
import { RootState } from 'state'

export function listUsersByWorkspaceId(
  state: RootState,
  workspaceId: string
): string[] {
  return state.userManagement.usersByWorkspaceId[workspaceId] || []
}

export function listUsersInFocusedWorkspace(state: RootState): string[] {
  const currentWorkspaceId = selectors.workspaces.getFocusedWorkspaceId(state)
  return listUsersByWorkspaceId(state, currentWorkspaceId)
}
