import selectors from 'selectors'
import { RootState } from 'state'
import { TrayWindowState } from './index'

export function isTrayWindowOpen(state: RootState): boolean {
  return state.electronTray.trayOpen
}

export function isPipWindowOpen(state: RootState): boolean {
  return state.electronTray.pipOpen
}

export function trayWindowState(state: RootState): TrayWindowState {
  const focusedRoom = selectors.rooms.getFocusedRoom(state)
  const focusedRoomStatus = selectors.rooms.getRoomStatus(
    state,
    focusedRoom?.id || ''
  )

  const workspace = selectors.workspaces.getSelfWorkspace(state)
  const localUser = selectors.users.getSelf(state)
  const localStatus = selectors.status.getLocalStatus(state)
  const participants = selectors.rooms
    .getUsersInRoom(state, focusedRoom?.id || '')
    .map((userId) => {
      return {
        userId: userId,
        user: selectors.users.getById(state, userId),
        participant: selectors.call.getParticipantStatusByUserId(state, userId),
        status: selectors.status.getStatusByUserId(state, userId),
        isOnline: selectors.presence.isUserOnline(state, userId),
        isActive: selectors.status.isUserActive(state, userId),
        isSelf: userId === localUser?.id,
      }
    })

  return {
    focusedRoom,
    focusedRoomStatus,
    localUser,
    localStatus,
    participants,
    workspace,
  }
}
