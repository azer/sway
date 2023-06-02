import selectors from 'selectors'
import { RootState } from 'state'

export function getMembersByRoomId(state: RootState, roomId: string): string[] {
  return state.roomMembers.userIdsByRoomId[roomId] || []
}

export function getMembersOfFocusedRoom(state: RootState): string[] {
  const roomId = selectors.rooms.getFocusedRoomId(state)
  return state.roomMembers.userIdsByRoomId[roomId] || []
}
