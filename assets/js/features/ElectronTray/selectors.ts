import { RoomStatus } from 'features/Room/selectors'
import selectors from 'selectors'
import { RootState } from 'state'
import { initialState } from 'state/entities'

export interface TrayWindowState {
  entities: typeof initialState
  localUserId?: string
  focusedRoomId?: string
  otherUsers: string[]
  userStatuses: { [id: string]: string }
  focusedRoomMode?: RoomStatus
  onlineUsers: string[]
}

export function snapshotForTrayWindow(state: RootState): TrayWindowState {
  const room = selectors.rooms.getFocusedRoom(state)
  const roomMode = room && selectors.rooms.getRoomStatus(state, room?.id)
  const localUser = selectors.users.getSelf(state)
  const otherUsers = selectors.rooms.getOtherUsersInSameRoom(state)

  return {
    entities: state.entities,
    localUserId: localUser?.id,
    focusedRoomId: room?.id,
    focusedRoomMode: roomMode,
    otherUsers: otherUsers,
    userStatuses: state.presence.userStatuses,
    onlineUsers: state.userSocket.onlineUsers,
  }
}
