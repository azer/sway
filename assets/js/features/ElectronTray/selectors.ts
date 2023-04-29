import selectors from 'selectors'
import { RootState } from 'state'
import { TrayWindowState } from './index'

export function isTrayWindowOpen(state: RootState): boolean {
  return state.electronTray.windowOpen
}

export function trayWindowState(state: RootState): TrayWindowState {
  const focusedRoom = selectors.rooms.getFocusedRoom(state)
  const focusedRoomStatus = selectors.rooms.getRoomStatus(
    state,
    focusedRoom?.id || ''
  )
  const localUser = selectors.users.getSelf(state)
  const localStatus = selectors.statuses.getLocalStatus(state)
  const participants = selectors.rooms
    .getOtherUsersInRoom(state, focusedRoom?.id || '')
    .map((userId) => {
      return {
        userId: userId,
        user: selectors.users.getById(state, userId),
        participant: selectors.call.getParticipantStatusByUserId(state, userId),
        status: selectors.statuses.getByUserId(state, userId),
        isOnline: selectors.presence.isUserOnline(state, userId),
        isActive: selectors.presence.isUserActive(state, userId),
      }
    })

  return {
    focusedRoom,
    focusedRoomStatus,
    localUser,
    localStatus,
    participants,
  }
}
