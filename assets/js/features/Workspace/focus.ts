import { CommandPaletteFocus } from 'features/CommandPalette/focus'
import { RoomFocus, initialRoomFocus } from 'features/Room/focus'
import { initialSidebarFocus, SidebarFocus } from 'features/Sidebar/focus'

export enum WorkspaceFocusRegion {
  Room = 'room',
  CommandPalette = 'command_palette',
  Sidebar = 'sidebar',
}

export interface WorkspaceFocus {
  region: WorkspaceFocusRegion
  workspaceId: string
  room: RoomFocus
  commandPalette?: CommandPaletteFocus
  sidebar: SidebarFocus
}

export const initialWorkspaceFocus: WorkspaceFocus = {
  // @ts-ignore
  workspaceId: window.initialState.focus.workspaceId,
  room: initialRoomFocus,
  region: WorkspaceFocusRegion.Room,
  sidebar: initialSidebarFocus,
}
