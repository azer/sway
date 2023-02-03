import { RoomFocus, initialRoomFocus } from 'features/Room/focus'

export interface WorkspaceFocus {
  workspaceId: string
  room: RoomFocus
}

export const initialWorkspaceFocus: WorkspaceFocus = {
  // @ts-ignore
  workspaceId: window.initialState.focus.workspaceId,
  room: initialRoomFocus,
}
