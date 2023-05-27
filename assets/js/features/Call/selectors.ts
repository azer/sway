import { ConnectionState } from 'features/Dock/slice'
import selectors from 'selectors'
import { RootState } from 'state'
import { CallParticipantStatus } from './slice'

export function getParticipantStatusByUserId(
  state: RootState,
  userId: string
): CallParticipantStatus | undefined {
  return state.call.participantStatus[userId]
}

export function shouldReconnect(state: RootState): boolean {
  const status = selectors.dock.getSelfConnectionStatus(state)
  return (
    status?.dailyCall === ConnectionState.Disconnected &&
    status.internet === ConnectionState.Connected
  )
}

export function getActiveUsersInCurrentCall(state: RootState): string[] {
  const roomId = selectors.rooms.getFocusedRoomId(state)
  return selectors.rooms
    .getUsersInRoom(state, roomId)
    .filter((uid) => selectors.presence.isUserActive(state, uid))
}

export function isUserScreensharing(state: RootState, userId: string): boolean {
  return state.call.participantStatus[userId]?.screenOn || false
}

export function filterScreensharingUsers(
  state: RootState
): (userId: string) => boolean {
  return function (userId: string) {
    return isUserScreensharing(state, userId)
  }
}

export function shouldHideVideo(state: RootState): boolean {
  if (selectors.electronTray.isPipWindowOpen(state)) return true

  if (!selectors.focus.isWindowVisible(state)) return true

  return false
}
