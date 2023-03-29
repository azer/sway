import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'room_members'

interface State {
  userIdsByRoomId: { [key: string]: string[] }
}

export const initialState: State = {
  userIdsByRoomId: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setRoomMemberUserIdMap: (
      state,
      action: PayloadAction<{ roomId: string; userIds: string[] }>
    ) => {
      state.userIdsByRoomId[action.payload.roomId] = action.payload.userIds
    },
  },
})

export const { setRoomMemberUserIdMap } = slice.actions
export default slice.reducer
