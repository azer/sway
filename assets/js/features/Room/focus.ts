import { DockFocus, initialDockFocus } from 'features/Dock/focus'

export interface RoomFocus {
  roomId: string
  dock: DockFocus
}

export const initialRoomFocus: RoomFocus = {
  roomId: (window as any).initialState.focus.roomId,
  dock: initialDockFocus,
}
