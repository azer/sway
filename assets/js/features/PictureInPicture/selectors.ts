import { CallParticipantStatus } from 'features/Call/slice'
import selectors from 'selectors'
import { RootState } from 'state'

export function getVisibleParticipant(
  state: RootState
): CallParticipantStatus | undefined {
  const localUserId = selectors.session.getUserId(state)

  const participants = selectors.call
    .getActiveUsersInCurrentCall(state)
    .map((userId) => selectors.call.getParticipantStatusByUserId(state, userId))

  if (participants.length === 1) {
    return participants[0]
  }

  return participants.filter((p) => p?.swayUserId !== localUserId)[0]
}
