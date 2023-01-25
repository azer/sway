import { ShellFocusRegion } from 'features/Shell/focus'
import selectors from 'selectors'
import { RootState } from 'state'
import { PresenceMode, Room, Rooms } from 'state/entities'

export function getRoomById(state: RootState, id: string): Room {
  return state.entities[Rooms][id]
}

export function listAllRooms(state: RootState): string[] {
  return state.rooms.orgRoomIds.map((id) => String(id))
}

export function listActiveRooms(state: RootState): string[] {
  return state.rooms.orgRoomIds
    .map((id) => getRoomById(state, id))
    .filter((r) => r && r.isActive)
    .map((r) => r.id)
}

export function getFocusedRoomId(state: RootState): string {
  return selectors.shell.getFocus(state).center.room.roomId
}

export function getFocusedRoom(state: RootState): Room | undefined {
  return getRoomById(state, getFocusedRoomId(state))
}

export function getPrevRoom(state: RootState): Room | undefined {
  const focusedId = getFocusedRoomId(state)
  const idx = state.rooms.orgRoomIds.findIndex((id) => id === focusedId)

  let prevId
  let i = idx
  while (i--) {
    if (getRoomById(state, state.rooms.orgRoomIds[i])?.isActive) {
      prevId = state.rooms.orgRoomIds[i]
      break
    }
  }

  return prevId ? getRoomById(state, prevId) : undefined
}

/*export function getFocusedRoomByUserId(state: RootState, userId: string): Room {
  //selectors.rooms.getUsersInRoom
}*/

export function getUsersInRoom(state: RootState, roomId: string): string[] {
  return state.rooms.users[roomId] || []
}

export function getRoomBySlug(
  state: RootState,
  slug: string
): Room | undefined {
  return listAllRooms(state)
    .map((id) => getRoomById(state, id))
    .find((r) => r?.slug === slug)
}

export function getDefaultRoom(state: RootState): Room | undefined {
  return listAllRooms(state)
    .map((id) => getRoomById(state, id))
    .find((r) => r?.isDefault)
}

export function isFocusOnRoom(state: RootState): boolean {
  return (
    selectors.shell.isFocusOnShell(state) &&
    selectors.shell.getFocus(state).region === ShellFocusRegion.Center
  )
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

  if (statuses.some((s) => s.is_active)) return RoomStatus.Active

  return RoomStatus.Focus
}
