import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateWorkspaceFocus } from 'features/Focus'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import { useNavigate } from 'react-router-dom'
import selectors from 'selectors'
import { AppDispatch, RootState } from 'state'

export const name = 'room'

interface State {
  userIdsByRoom: { [id: string]: string[] }
  roomIdsByWorkspace: { [id: string]: string[] }
  privateRoomIdsByWorkspace: { [id: string]: string[] }
  roomMembers: { [id: string]: string[] }
}

export const initialState: State = {
  // @ts-ignore
  userIdsByRoom: window.initialState.room.userIdsByRoom,
  // @ts-ignore
  roomIdsByWorkspace: window.initialState.room.roomIdsByWorkspace || [],
  // @ts-ignore
  privateRoomIdsByWorkspace: window.initialState.room.privateRoomIdsByWorkspace,
  roomMembers: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setWorkspaceRoomIds: (
      state,
      action: PayloadAction<{
        roomIds: string[]
        workspaceId: string
        privateRoom?: boolean
      }>
    ) => {
      const roomIds = action.payload.privateRoom
        ? state.privateRoomIdsByWorkspace
        : state.roomIdsByWorkspace

      roomIds[action.payload.workspaceId] = action.payload.roomIds
    },
    appendRoomIdToWorkspace: (
      state,
      action: PayloadAction<{
        workspaceId: string
        roomId: string
        privateRoom?: boolean
      }>
    ) => {
      const roomIds = action.payload.privateRoom
        ? state.privateRoomIdsByWorkspace
        : state.roomIdsByWorkspace

      if (
        !roomIds[action.payload.workspaceId].includes(action.payload.roomId)
      ) {
        roomIds[action.payload.workspaceId] = [
          ...roomIds[action.payload.workspaceId],
          action.payload.roomId,
        ]
      }
    },
    moveUserToRoom: (
      state,
      action: PayloadAction<{ userId: string; roomId: string }>
    ) => {
      for (const roomId in state.userIdsByRoom) {
        state.userIdsByRoom[roomId] = state.userIdsByRoom[roomId].filter(
          (uid) => uid !== action.payload.userId
        )
      }

      state.userIdsByRoom[action.payload.roomId] = [
        ...(state.userIdsByRoom[action.payload.roomId] || []),
        action.payload.userId,
      ]
    },
    setAllRoomUserIds: (
      state,
      action: PayloadAction<{ [id: string]: string[] }>
    ) => {
      // @ts-ignore
      state.userIdsByRoom = action.payload
    },
  },
})

export const {
  setAllRoomUserIds,
  setWorkspaceRoomIds,
  appendRoomIdToWorkspace,
  moveUserToRoom,
} = slice.actions
export default slice.reducer

export function setFocusedRoomById(id: string) {
  return updateWorkspaceFocus((focus) => {
    focus.room.roomId = id
    focus.region = WorkspaceFocusRegion.Room
  })
}

export function setFocusedRoomBySlug(slug: string) {
  return updateWorkspaceFocus((focus, getState) => {
    const state = getState()
    const room = selectors.rooms.getRoomBySlug(state, slug)
    if (room) {
      focus.room.roomId = room.id
      focus.region = WorkspaceFocusRegion.Room
    }
  })
}
