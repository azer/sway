import selectors from 'selectors'
import { RootState } from 'state'
import * as entities from 'state/entities'
import { Focus } from 'state/presence'

export function getById(
  state: RootState,
  id: string
): entities.Status | undefined {
  return state.entities.statuses[id]
}

export function getByUserId(state: RootState, userId: string): entities.Status {
  const status = getById(state, state.presence.userStatuses[userId])
  if (status) {
    return status
  }

  const room = selectors.rooms.getDefaultRoom(state)
  return {
    id: 'default',
    user_id: userId,
    room_id: room?.id || '',
    status: Focus.status,
    camera_on: false,
    mic_on: false,
    speaker_on: false,
    message: '',
    // @ts-ignore
    inserted_at: undefined,
  }
}

export function getLocalStatus(state: RootState): entities.Status {
  const userId = selectors.users.getSelf(state)?.id
  return getByUserId(state, userId || '')
}
