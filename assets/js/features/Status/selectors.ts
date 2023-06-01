import selectors from 'selectors'
import { RootState } from 'state'
import * as entities from 'state/entities'
import { StatusModeKey } from 'state/status'
import { findStatusModeByKey } from 'state/status'

export function getById(
  state: RootState,
  id: string
): entities.Status | undefined {
  return state.entities.statuses[id]
}

export function getLatestStatusMapByUserId(
  state: RootState,
  userId: string
): { [workspaceId: string]: string } {
  return state.status.latestStatusByUserId[userId] || {}
}

export function getByUserId(
  state: RootState,
  userId: string
): string | undefined {
  return getLatestStatusMapByUserId(state, userId)[
    selectors.workspaces.getFocusedWorkspaceId(state)
  ]
}

export function getStatusByUserId(
  state: RootState,
  userId: string
): entities.Status {
  const id = getByUserId(state, userId)
  const status = id ? getById(state, id) : undefined

  if (status) {
    return status
  }

  const room = selectors.rooms.getDefaultRoom(state)
  return {
    id: 'default',
    user_id: userId,
    room_id: room?.id || '',
    status: StatusModeKey.Online,
    camera_on: false,
    mic_on: false,
    speaker_on: false,
    message: '',
    // @ts-ignore
    inserted_at: undefined,
  }
}

export function getLocalStatus(state: RootState): entities.Status {
  const userId = selectors.users.getSelf(state)?.id
  return getStatusByUserId(state, userId || '')
}

export function isUserActive(state: RootState, userId: string): boolean {
  const status = getStatusByUserId(state, userId)
  return status.mic_on || status.camera_on
}

export function isLocalUserActive(state: RootState): boolean {
  return isUserActive(state, selectors.users.getSelf(state)?.id || '')
}

export function filterActiveUsers(
  state: RootState,
  active: boolean
): (userId: string) => boolean {
  return function (userId: string) {
    return isUserActive(state, userId) === active
  }
}

export function getStatusLabelByUserId(
  state: RootState,
  userId: string
): string {
  const status = getStatusByUserId(state, userId)
  const isOnline = selectors.presence.isUserOnline(state, userId)
  if (!isOnline) {
    return 'Offline'
  }

  return findStatusModeByKey(status.status)?.label || ''
}

export function getStatusUpdatesByUserId(
  state: RootState,
  userId: string
): string[] {
  const updates = state.status.statusUpdatesByUserId[userId]
  if (!updates) return []

  const workspaceId = selectors.workspaces.getFocusedWorkspaceId(state)

  return updates[workspaceId] || []
}

export function getStatusUpdatesByRoomId(
  state: RootState,
  roomId: string
): string[] {
  return state.status.statusUpdatesByRoomId[roomId] || []
}

export function listMissingStatusRecords(state: RootState): string[] {
  const onlineUsers = selectors.presence.getOnlineUsersInWorkspace(state)
  return onlineUsers
    .map((userId) => selectors.status.getByUserId(state, userId))
    .filter(
      (statusId) => !!statusId && !selectors.status.getById(state, statusId)
    ) as string[]
}
