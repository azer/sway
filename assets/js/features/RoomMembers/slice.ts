import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RoomMember, Row } from 'state/entities'

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
    addRoomMembers: (state, action: PayloadAction<Row<RoomMember>[]>) => {
      for (const row of action.payload) {
        if (state.userIdsByRoomId[row.data.room_id]) {
          if (
            !state.userIdsByRoomId[row.data.room_id].includes(row.data.user_id)
          ) {
            state.userIdsByRoomId[row.data.room_id].push(row.data.user_id)
          }
        } else {
          state.userIdsByRoomId[row.data.room_id] = [row.data.user_id]
        }
      }
    },
  },
})

export const { setRoomMemberUserIdMap, addRoomMembers } = slice.actions
export default slice.reducer
