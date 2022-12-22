import { RootState } from 'state'
import { CallParticipantStatus } from './slice'

export function getParticipantStatusByUserId(
  state: RootState,
  userId: string
): CallParticipantStatus | undefined {
  return state.call.participantStatus[userId]
}
