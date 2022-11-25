import selectors from 'selectors'
import { RootState } from 'state'
import {
  PresenceMode,
  PresenceStatus,
  CallStatus,
  ConnectionStatus,
  ConnectionState,
} from './slice'

export function getPresenceStatusByUserId(
  state: RootState,
  userId: string
): PresenceStatus {
  return state.status.presence[userId] || { userId, mode: PresenceMode.Active }
}

export function getCallStatusByUserId(
  state: RootState,
  userId: string
): CallStatus | undefined {
  return state.status.call[userId]
}

export function getConnectionStatusByUserId(
  state: RootState,
  userId: string
): ConnectionStatus | undefined {
  return state.status.connection[userId]
}

export function getSelfPresenceStatus(
  state: RootState
): PresenceStatus | undefined {
  const userId = selectors.users.getSelf(state)?.id
  return userId ? getPresenceStatusByUserId(state, userId) : undefined
}

export function getSelfCallStatus(state: RootState): CallStatus | undefined {
  const userId = selectors.users.getSelf(state)?.id
  return userId ? getCallStatusByUserId(state, userId) : undefined
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
  return state.status.connection[userId]?.bafaSocket || ConnectionState.Ready
}

export function getBafaRoomConnectionStatus(
  state: RootState,
  userId: string
): ConnectionState {
  return state.status.connection[userId]?.bafaRoom || ConnectionState.Ready
}

export function getDailyRoomConnectionStatus(
  state: RootState,
  userId: string
): ConnectionState {
  return state.status.connection[userId]?.dailyRoom || ConnectionState.Ready
}

export function isBafaSocketConnected(state: RootState): boolean {
  if (!state.session.id) return false
  return (
    getBafaSocketConnectionStatus(state, state.session.id) ===
    ConnectionState.Successful
  )
}
