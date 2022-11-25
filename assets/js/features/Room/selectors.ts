import { ShellFocusRegion } from 'features/Shell/focus'
import selectors from 'selectors'
import { RootState } from 'state'
import { Room, Rooms, User } from 'state/entities'

export function getRoomById(state: RootState, id: string): Room {
  return state.entities[Rooms][id]
}

export function listAllRooms(state: RootState): string[] {
  return state.rooms.orgRoomIds.map((id) => String(id))
}

export function getFocusedRoomId(state: RootState): string {
  return selectors.shell.getFocus(state).center.room.roomId
}

export function getFocusedRoom(state: RootState): Room {
  return getRoomById(state, getFocusedRoomId(state))
}

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
