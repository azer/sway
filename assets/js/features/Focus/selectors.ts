import { RootState } from 'state'

export function hasWindowFocus(state: RootState): boolean {
  return state.focus.windowHasFocus
}
