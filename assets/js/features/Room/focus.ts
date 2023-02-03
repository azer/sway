export interface RoomFocus {
  roomId: string
}

export const initialRoomFocus: RoomFocus = {
  roomId: (window as any).initialState.focus.roomId,
}
