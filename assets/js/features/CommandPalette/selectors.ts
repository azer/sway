import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import { RootState } from 'state'

export function isOpen(state: RootState): boolean {
  return state.focus.workspace.region === WorkspaceFocusRegion.CommandPalette
}

export function getSelectedId(state: RootState): string | undefined {
  return state.focus.workspace.commandPalette?.selectedItemId
}
