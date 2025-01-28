import { RootState } from 'state'

export function isScreenSharing(state: RootState): boolean {
  return state.screenshare.on
}
