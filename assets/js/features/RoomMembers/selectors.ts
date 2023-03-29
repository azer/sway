import selectors from 'selectors'
import { RootState } from 'state'

export function getMembersByRoomId(state: RootState, roomId: string): string[] {
  return state.roomMembers.userIdsByRoomId[roomId] || []
}
