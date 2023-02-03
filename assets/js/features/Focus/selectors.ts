import { WorkspaceFocus } from 'features/Workspace/focus'
import { RootState } from 'state'

export function hasWindowFocus(state: RootState): boolean {
  return state.focus.windowHasFocus
}

export function getWorkspaceFocus(state: RootState): WorkspaceFocus {
  return state.focus.workspace
}

export function isFocusOnWorkspace(state: RootState): boolean {
  return !hasWindowFocus(state)
}
