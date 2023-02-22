import { RootState } from 'state'
import * as entities from 'state/entities'
import selectors from '.'

export function getById(
  state: RootState,
  id: string
): entities.Workspace | undefined {
  return state.entities.workspaces[id]
}

export function getSelfWorkspace(
  state: RootState
): entities.Workspace | undefined {
  const membership = selectors.memberships.getSelfMembership(state)
  return membership ? getById(state, membership.workspace_id) : undefined
}

export function listUsersByWorkspaceId(
  state: RootState,
  workspaceId: string
): string[] {
  return state.workspaces.members[workspaceId] || []
}

export function getWorkspaceIdByUserId(
  state: RootState,
  userId: string
): string | undefined {
  for (const workspaceId in state.workspaces.members) {
    if (state.workspaces.members[workspaceId].includes(userId)) {
      return workspaceId
    }
  }
}
