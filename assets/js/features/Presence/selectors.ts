import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import selectors from 'selectors'
import { RootState } from 'state'
import { Status } from 'state/entities'
import { findModeByStatus } from 'state/presence'

export function isUserActive(state: RootState, userId: string): boolean {
  const status = selectors.statuses.getByUserId(state, userId)
  return status.mic_on || status.camera_on
}

export function isLocalUserActive(state: RootState): boolean {
  return isUserActive(state, selectors.users.getSelf(state)?.id || '')
}

export function getPresenceLabelByUserId(
  state: RootState,
  userId: string
): string {
  const status = selectors.statuses.getByUserId(state, userId)
  const isOnline = isUserOnline(state, userId)
  if (!isOnline) {
    return 'Offline'
  }

  return findModeByStatus(status.status)?.label || ''
}

export function getPresenceIconByUserId(
  state: RootState,
  userId: string
): string {
  const isActive = selectors.presence.isUserActive(state, userId)
  if (isActive) {
    return 'phoneCall'
  }

  return (
    findModeByStatus(selectors.statuses.getByUserId(state, userId).status)
      ?.icon || ''
  )
}

export function getUserUpdatesByUserId(
  state: RootState,
  userId: string
): Status[] {
  return (state.presence.statusUpdates[userId] || [])
    .map((id) => selectors.statuses.getById(state, id))
    .filter((u) => !!u) as Status[]
}

/*export function getLocalPresenceLabel(state: RootState): string {
  return getPresenceLabelByUserId(
    state,
    selectors.users.getSelf(state)?.id || ''
  )
}

export function getPresenceLabelByUserId(
  state: RootState,
  userId: string
): string {
  const isActive = selectors.presence.isUserActive(state, userId)
  if (isActive) {
    return 'phone'
  }

  return (
    findModeByStatus(selectors.statuses.getByUserId(state, userId).status)
      ?.label || ''
  )
}*/

export function isSpaceButtonEnabled(state: RootState): boolean {
  return (
    state.focus.workspace.region === WorkspaceFocusRegion.Room &&
    !state.focus.workspace.room.dock
  )
}

export function isUserOnline(state: RootState, userId: string): boolean {
  return state.userSocket.onlineUsers.indexOf(userId) > -1
}

export function sortUsersByPresence(
  state: RootState
): (userA: string, userB: string) => number {
  const onlineMap = createOnlineUsersMap(state)

  return function (a: string, b: string): number {
    if (onlineMap[a] || !onlineMap[b]) return -1
    if (!onlineMap[a] || onlineMap[b]) return 1
    return 0
  }
}

export function filterActiveUsers(
  state: RootState,
  active: boolean
): (userId: string) => boolean {
  return function (userId: string) {
    return isUserActive(state, userId) === active
  }
}

function createOnlineUsersMap(state: RootState): Record<string, boolean> {
  const onlineMap: Record<string, boolean> = {}
  for (const id of state.userSocket.onlineUsers) {
    onlineMap[id] = true
  }

  return onlineMap
}
