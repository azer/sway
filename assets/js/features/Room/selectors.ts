import { firstName } from 'lib/string'
import selectors from 'selectors'
import { RootState } from 'state'
import { Room, Rooms } from 'state/entities'
import { RoomFocus } from './focus'

export function getRoomById(state: RootState, id: string): Room {
  const room = state.entities[Rooms][id]
  if (!room && id.startsWith('1v1_')) {
    return {
      id,
      workspace_id: selectors.workspaces.getFocusedWorkspaceId(state),
      user_id: selectors.users.getSelf(state)?.id || '',
      name: 'temporary room',
      slug: id,
      is_private: true,
      is_active: true,
      is_default: false,
    }
  }

  if (!room?.is_private) return room

  const localUser = selectors.users.getSelf(state)
  const otherUsers = selectors.roomMembers
    .getMembersByRoomId(state, id)
    .filter((userId) => localUser?.id !== userId)
    .map((id) => selectors.users.getById(state, id))

  if (!localUser || otherUsers.length === 0 || !otherUsers.every((u) => !!u)) {
    return room
  }

  if (otherUsers.length === 1) {
    return {
      ...room,
      name: `${firstName(otherUsers[0]?.name || '')} & ${firstName(
        localUser?.name || ''
      )}`,
    }
  }

  return {
    ...room,
    name: `${otherUsers
      .map((u) => firstName(u?.name || ''))
      .join(', ')}, ${firstName(localUser.name || '')}`,
  }
}

export function listAllRooms(state: RootState, workspaceId: string): string[] {
  return state.rooms.roomIdsByWorkspace[workspaceId]
}

export function listAllPrivateRooms(
  state: RootState,
  workspaceId: string
): string[] {
  const localUserId = selectors.session.getUserId(state)
  if (!localUserId) return []

  return state.rooms.privateRoomIdsByWorkspace[workspaceId].filter((id) =>
    state.roomMembers.userIdsByRoomId[id]?.includes(localUserId)
  )
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

// condition to be an active private room:
// the other user is inside
// or the local user is inside
// recently communicated with?
// FIXME: make sure the private rooms local user isn't a part of hidden
export function listActivePrivateRooms(state: RootState): string[] {
  const localWorkspaceId =
    selectors.memberships.getSelfMembership(state)?.workspace_id

  const allPrivateRooms = localWorkspaceId
    ? state.rooms.privateRoomIdsByWorkspace[localWorkspaceId]
    : []

  return allPrivateRooms.filter(
    (roomId) => getUsersInRoom(state, roomId).length > 0
  )
}

export function getFocus(state: RootState): RoomFocus {
  return selectors.focus.getWorkspaceFocus(state).room
}

export function getFocusedRoomId(state: RootState): string {
  return getFocus(state).roomId
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
  return state.presence.onlineUsersByRoomId[roomId] || []
}

export function getOtherUsersInRoom(
  state: RootState,
  roomId: string
): string[] {
  const users = getUsersInRoom(state, roomId)
  const localUserId = selectors.users.getSelf(state)?.id

  return users.filter((id) => id !== localUserId)
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
  const all = localWorkspaceId ? listAllRooms(state, localWorkspaceId) : []

  const defaultRoom = all
    .map((id) => getRoomById(state, id))
    .find((r) => r?.is_default)

  return defaultRoom || all.length > 0 ? getRoomById(state, all[0]) : undefined
}

export function get1v1RoomIdByUserId(
  state: RootState,
  userId: string
): string | undefined {
  const workspace = selectors.workspaces.getSelfWorkspace(state)
  if (!workspace) return

  return selectors.rooms
    .listAllPrivateRooms(state, workspace.id)
    .filter((roomId) => {
      const members = selectors.roomMembers.getMembersByRoomId(state, roomId)
      return members.includes(userId) && members.length == 2
    })[0]
}

export function get1v1RoomByUserId(
  state: RootState,
  userId: string
): Room | undefined {
  const id = get1v1RoomIdByUserId(state, userId)
  return id ? getRoomById(state, id) : undefined
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
    selectors.status.isUserActive(state, userId)
  )

  if (statuses.length === 0) {
    return RoomStatus.Offline
  }

  if (statuses.includes(true)) return RoomStatus.Active

  return RoomStatus.Focus
}

export function isSomeoneScreenSharing(
  state: RootState,
  roomId: string
): boolean {
  return getUsersInRoom(state, roomId).some(
    (userId: string) => state.call.participantStatus[userId]?.screenOn
  )
}
