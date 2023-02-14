import selectors from 'selectors'
import { RootState } from 'state'
import { PresenceMode, Status } from 'state/entities'
import { DefaultPresenceMode } from './slice'

export function getStatusByUserId(state: RootState, userId: string): Status {
  const statusId = state.presence.userStatuses[userId]
  const status = selectors.statuses.getById(state, statusId || '')
  if (status) {
    return status
  }

  const room = selectors.rooms.getDefaultRoom(state)

  return {
    id: 'default',
    user_id: userId,
    room_id: room?.id || '',
    status: DefaultPresenceMode,
    camera_on: false,
    mic_on: false,
    speaker_on: false,
    message: '',
    // @ts-ignore
    inserted_at: undefined,
  }
}

export function getSelfStatus(state: RootState): Status {
  const userId = selectors.users.getSelf(state)?.id || ''
  return getStatusByUserId(state, userId)
}

export function getSelfStatusLabel(state: RootState): string {
  const mode = getSelfStatus(state).status

  if (mode === PresenceMode.Social) return 'Social'
  if (mode === PresenceMode.Solo) return 'Solo'
  if (mode === PresenceMode.Zen) return 'Zen'
  return 'Focus'
}

export function isUserActiveOrVisible(
  state: RootState,
  userId: string
): boolean {
  const status = getStatusByUserId(state, userId)
  return status.mic_on || status.status === PresenceMode.Social
}

export function isLocalUserActive(state: RootState): boolean {
  return getSelfStatus(state)?.mic_on || false
}

export function isUserActive(state: RootState, userId: string): boolean {
  const status = getStatusByUserId(state, userId)
  return status.mic_on
}
