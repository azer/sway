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
  // @ts-ignore
  //return undefined

  return {
    id: 'default',
    user_id: userId,
    room_id: room?.id || '',
    status: DefaultPresenceMode,
    is_active: false,
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
