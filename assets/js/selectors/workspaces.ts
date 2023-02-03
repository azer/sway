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

export function getUsersByOrgId(state: RootState): entities.User[] {
  return Object.values(state.entities[entities.Users])
}
