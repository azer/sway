import { logger } from 'lib/log'
import selectors from 'selectors'
import { RootState } from 'state'
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

export function getSwaySocketConnectionStatus(
  state: RootState,
  userId: string
): ConnectionState {
  return state.dock.connection[userId]?.swaySocket || ConnectionState.Ready
}

export function getSwayRoomConnectionStatus(
  state: RootState,
  userId: string
): ConnectionState {
  return state.dock.connection[userId]?.swayRoom || ConnectionState.Ready
}

export function isSwaySocketConnected(state: RootState): boolean {
  if (!state.session.id) return false
  return (
    getSwaySocketConnectionStatus(state, state.session.id) ===
    ConnectionState.Connected
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
  if (status.swaySocket === ConnectionState.Connecting) {
    return { msg: 'Opening socket', status: ConnectionState.Connecting }
  }

  if (status.swayRoom === ConnectionState.Connecting) {
    return { msg: 'Joining room', status: ConnectionState.Connecting }
  }

  if (status.dailyCall === ConnectionState.Connecting) {
    return {
      msg: 'Opening media connection',
      status: ConnectionState.Connecting,
    }
  }

  // failed
  if (status.swaySocket === ConnectionState.Failed) {
    return { msg: "Can't open socket", status: ConnectionState.Failed }
  }

  if (status.swayRoom === ConnectionState.Failed) {
    return { msg: "Can't join room", status: ConnectionState.Failed }
  }

  if (status.dailyCall === ConnectionState.Failed) {
    return { msg: 'Media connection failed', status: ConnectionState.Failed }
  }

  // disconnected
  if (status.swaySocket === ConnectionState.Disconnected) {
    return {
      msg: 'Lost socket connection',
      status: ConnectionState.Disconnected,
    }
  }

  if (status.swayRoom === ConnectionState.Disconnected) {
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
