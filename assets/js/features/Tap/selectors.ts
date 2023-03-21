import selectors from 'selectors'
import { RootState } from 'state'
import { StatusHook } from './slice'

export function getTriggeredStatusHooks(state: RootState): StatusHook[] {
  return Object.values(state.taps.statusHooks).filter((hook) => {
    const status = selectors.statuses.getByUserId(state, hook?.userId)
    if (hook.whenActive) {
      return status.camera_on || status.mic_on
    }

    if (hook.whenPresentAs) {
      return hook.whenPresentAs === status?.status
    }
  })
}

export function getStatusHookByUserId(
  state: RootState,
  userId: string
): StatusHook | undefined {
  return state.taps.statusHooks[userId]
}
