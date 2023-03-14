import { CommandPaletteFocus } from 'features/CommandPalette/focus'
import { RoomFocus, initialRoomFocus } from 'features/Room/focus'

export enum WorkspaceFocusRegion {
  Room = 'room',
  CommandPalette = 'command_palette',
}

export interface WorkspaceFocus {
  region: WorkspaceFocusRegion
  workspaceId: string
  room: RoomFocus
  commandPalette?: CommandPaletteFocus
}

export const initialWorkspaceFocus: WorkspaceFocus = {
  // @ts-ignore
  workspaceId: window.initialState.focus.workspaceId,
  room: initialRoomFocus,
  region: WorkspaceFocusRegion.Room,
}
