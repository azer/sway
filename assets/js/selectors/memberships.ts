import selectors from 'selectors'
import { RootState } from 'state'
import { Membership, Memberships } from 'state/entities'

export function getById(state: RootState, id: string): Membership | undefined {
  return state.entities.memberships[id]
}

export function getSelfMembership(state: RootState): Membership | undefined {
  const user = selectors.users.getSelf(state)
  return user ? getMembershipByUserId(state, user.id) : undefined
}

export function listAll(state: RootState): Membership[] {
  return Object.values(state.entities[Memberships])
}

export function getMembershipByUserId(
  state: RootState,
  userId: string
): Membership | undefined {
  return listAll(state).find((m) => m.user_id === userId)
}

export function listByWorkspaceId(
  state: RootState,
  workspaceId: string
): Membership[] {
  return listAll(state).filter((m) => m.workspace_id === workspaceId)
}
