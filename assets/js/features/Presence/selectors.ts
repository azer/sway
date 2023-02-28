import selectors from 'selectors'
import { RootState } from 'state'
import { findModeByStatus } from 'state/presence'

export function isUserActive(state: RootState, userId: string): boolean {
  const status = selectors.statuses.getByUserId(state, userId)
  return status.mic_on || status.camera_on
}

export function isLocalUserActive(state: RootState): boolean {
  return isUserActive(state, selectors.users.getSelf(state)?.id || '')
}

export function getLocalPresenceIcon(state: RootState): string {
  return getPresenceIconByUserId(
    state,
    selectors.users.getSelf(state)?.id || ''
  )
}

export function getPresenceIconByUserId(
  state: RootState,
  userId: string
): string {
  const isActive = selectors.presence.isUserActive(state, userId)
  if (isActive) {
    return 'phoneCall'
  }

  return (
    findModeByStatus(selectors.statuses.getByUserId(state, userId).status)
      ?.icon || ''
  )
}

export function getLocalPresenceLabel(state: RootState): string {
  return getPresenceLabelByUserId(
    state,
    selectors.users.getSelf(state)?.id || ''
  )
}

export function getPresenceLabelByUserId(
  state: RootState,
  userId: string
): string {
  const isActive = selectors.presence.isUserActive(state, userId)
  if (isActive) {
    return 'phone'
  }

  return (
    findModeByStatus(selectors.statuses.getByUserId(state, userId).status)
      ?.label || ''
  )
}
