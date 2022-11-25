import { RootState } from 'state'
import { ShellFocus } from './focus'

export function getFocus(state: RootState): ShellFocus {
  return state.focus.shell
}

export function isFocusOnShell(state: RootState): boolean {
  return !state.commandPalette.isOpen
}
