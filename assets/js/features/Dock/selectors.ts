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

export function getStatusMessage(state: RootState): {
  msg: string
  status: ConnectionState
} {
  const status = selectors.dock.getSelfConnectionStatus(state)
  if (!status)
    return { msg: 'Initializing', status: ConnectionState.Connecting }

  if (status.internet === ConnectionState.Disconnected) {
    return { msg: "You're offline.", status: ConnectionState.Disconnected }
  }

  // connecting
  if (status.bafaSocket === ConnectionState.Connecting) {
    return { msg: 'Opening socket', status: ConnectionState.Connecting }
  }

  if (status.bafaRoom === ConnectionState.Connecting) {
    return { msg: 'Joining room', status: ConnectionState.Connecting }
  }

  if (status.dailyCall === ConnectionState.Connecting) {
    return {
      msg: 'Opening media connection',
      status: ConnectionState.Connecting,
    }
  }

  // failed
  if (status.bafaSocket === ConnectionState.Failed) {
    return { msg: "Can't open socket", status: ConnectionState.Failed }
  }

  if (status.bafaRoom === ConnectionState.Failed) {
    return { msg: "Can't join room", status: ConnectionState.Failed }
  }

  if (status.dailyCall === ConnectionState.Failed) {
    return { msg: 'Media connection failed', status: ConnectionState.Failed }
  }

  // disconnected
  if (status.bafaSocket === ConnectionState.Disconnected) {
    return {
      msg: 'Lost socket connection',
      status: ConnectionState.Disconnected,
    }
  }

  if (status.bafaRoom === ConnectionState.Disconnected) {
    return {
      msg: 'Lost connection with room',
      status: ConnectionState.Disconnected,
    }
  }

  if (status.dailyCall === ConnectionState.Disconnected) {
    return {
      msg: 'Lost media connection',
      status: ConnectionState.Disconnected,
    }
  }

  //
  return { msg: 'Connected', status: ConnectionState.Connected }
}
