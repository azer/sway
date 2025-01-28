import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateWorkspaceFocus } from 'features/Focus'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'

export const name = 'command-palette'

interface State {}

export const initialState: State = {}

export const slice = createSlice({
  name,
  initialState,
  reducers: {},
})

export const {} = slice.actions
export default slice.reducer

export function setOpen(open: boolean) {
  return updateWorkspaceFocus((wsFocus) => {
    wsFocus.region = open
      ? WorkspaceFocusRegion.CommandPalette
      : WorkspaceFocusRegion.Room
  })
}

export function setSelectedId(selectedItemId: string | undefined) {
  return updateWorkspaceFocus((wsFocus) => {
    wsFocus.commandPalette = {
      ...wsFocus.commandPalette,
      selectedItemId,
    }
  })
}
