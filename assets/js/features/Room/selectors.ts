import { ShellFocusRegion } from 'features/Shell/focus'
import selectors from 'selectors'
import { RootState } from 'state'
import { PresenceMode, Room, Rooms } from 'state/entities'

export function getRoomById(state: RootState, id: string): Room {
  return state.entities[Rooms][id]
}

export function listAllRooms(state: RootState, workspaceId: string): string[] {
  return state.rooms.roomIdsByWorkspace[workspaceId]
}

export function listActiveRooms(state: RootState): string[] {
  const localWorkspaceId =
    selectors.memberships.getSelfMembership(state)?.workspace_id

  return localWorkspaceId
    ? state.rooms.roomIdsByWorkspace[localWorkspaceId]
        .map((id) => getRoomById(state, id))
        .filter((r) => r && r.is_active)
        .map((r) => r.id)
    : []
}

export function getFocusedRoomId(state: RootState): string {
  return selectors.focus.getWorkspaceFocus(state).room.roomId
}

export function getFocusedRoom(state: RootState): Room | undefined {
  return getRoomById(state, getFocusedRoomId(state))
}

export function getPresentRoomId(state: RootState): string | undefined {
  const localUserId = selectors.users.getSelf(state)?.id

  if (!localUserId) return

  for (const roomId in state.rooms.userIdsByRoom) {
    if (state.rooms.userIdsByRoom[roomId].includes(localUserId)) {
      return roomId
    }
  }
}

export function getPresentRoom(state: RootState): Room | undefined {
  return getRoomById(state, getPresentRoomId(state) || '')
}

export function getPrevRoom(state: RootState): Room | undefined {
  const localWorkspaceId =
    selectors.memberships.getSelfMembership(state)?.workspace_id

  const all = localWorkspaceId ? listAllRooms(state, localWorkspaceId) : []

  const focusedId = getFocusedRoomId(state)
  const idx = all.findIndex((id) => id === focusedId)

  let prevId
  let i = idx

  while (i >= 0 && i--) {
    if (getRoomById(state, all[i])?.is_active) {
      prevId = all[i]
      break
    }
  }

  return prevId ? getRoomById(state, prevId) : undefined
}

/*export function getFocusedRoomByUserId(state: RootState, userId: string): Room {
  //selectors.rooms.getUsersInRoom
}*/

export function getUsersInRoom(state: RootState, roomId: string): string[] {
  return state.rooms.userIdsByRoom[roomId] || []
}

export function getOtherUsersInSameRoom(state: RootState): string[] {
  const focusedRoomId = getFocusedRoom(state)?.id
  if (!focusedRoomId) return []

  const users = getUsersInRoom(state, focusedRoomId)
  const localUserId = selectors.users.getSelf(state)?.id

  return users.filter((id) => id !== localUserId)
}

export function getRoomBySlug(
  state: RootState,
  slug: string
): Room | undefined {
  const localWorkspaceId =
    selectors.memberships.getSelfMembership(state)?.workspace_id

  return localWorkspaceId
    ? listAllRooms(state, localWorkspaceId)
        .map((id) => getRoomById(state, id))
        .find((r) => r.slug === slug)
    : undefined
}

export function getDefaultRoom(state: RootState): Room | undefined {
  const localWorkspaceId =
    selectors.memberships.getSelfMembership(state)?.workspace_id

  return localWorkspaceId
    ? listAllRooms(state, localWorkspaceId)
        .map((id) => getRoomById(state, id))
        .find((r) => r?.is_default)
    : undefined
}

export function isFocusOnRoom(state: RootState): boolean {
  return selectors.focus.isFocusOnWorkspace(state)
}

export enum RoomStatus {
  Active = 'active',
  Focus = 'focus',
  Offline = 'offline',
}

export function getRoomStatus(
  state: RootState,
  roomId: string
): RoomStatus | undefined {
  const statuses = getUsersInRoom(state, roomId).map((userId: string) =>
    selectors.presence.getStatusByUserId(state, userId)
  )

  if (statuses.length === 0) {
    return RoomStatus.Offline
  }

  if (statuses.some((s) => s.mic_on)) return RoomStatus.Active

  return RoomStatus.Focus
}
