import { logger } from 'lib/log'
import selectors from 'selectors'
import { RootState } from 'state'
import { PresenceMode, Status } from 'state/entities'
import { ConnectionStatus, ConnectionState } from './slice'

const log = logger('dock/selectors')

export function getConnectionStatusByUserId(
  state: RootState,
  userId: string
): ConnectionStatus | undefined {
  return state.dock.connection[userId]
}

export function getSelfConnectionStatus(
  state: RootState
): ConnectionStatus | undefined {
  const userId = selectors.users.getSelf(state)?.id
  return userId ? getConnectionStatusByUserId(state, userId) : undefined
}

export function getBafaSocketConnectionStatus(
  state: RootState,
  userId: string
): ConnectionState {
  return state.dock.connection[userId]?.bafaSocket || ConnectionState.Ready
}

export function getBafaRoomConnectionStatus(
  state: RootState,
  userId: string
): ConnectionState {
  return state.dock.connection[userId]?.bafaRoom || ConnectionState.Ready
}

export function isBafaSocketConnected(state: RootState): boolean {
  if (!state.session.id) return false
  return (
    getBafaSocketConnectionStatus(state, state.session.id) ===
    ConnectionState.Connected
  )
}

export function isVideoInputOn(state: RootState): boolean {
  const isTurnedOff = selectors.settings.isVideoInputOff(state)
  const presence = selectors.presence.getSelfStatus(state)

  return (
    (presence.is_active || presence.status === PresenceMode.Social) &&
    !isTurnedOff
  )
}

export function isAudioInputOn(state: RootState): boolean {
  const isTurnedOff = selectors.settings.isAudioInputOff(state)
  const presence = selectors.presence.getSelfStatus(state)

  return presence.is_active && !isTurnedOff
}

export function isAudioOutputOn(state: RootState): boolean {
  const isTurnedOff = selectors.settings.isAudioOutputOff(state)
  const presence = selectors.presence.getSelfStatus(state)

  return (
    (presence.is_active || presence.status !== PresenceMode.Zen) && !isTurnedOff
  )
}
