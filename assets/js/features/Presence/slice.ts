import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { logger } from 'lib/log'

export const name = 'presence'
const log = logger('presence/slice')

interface State {
  onlineUsersByWorkspaceId: { [workspaceId: string]: string[] }
  onlineUsersByRoomId: { [roomId: string]: string[] }
}

export interface PhoenixPresenceState {
  [userId: string]: {
    metas: {
      online_at: string
      phx_ref: string
      phx_ref_prev?: string
      room_id: string
      user_id: string
      status_id: string
      workspace_id: string
    }[]
  }
}

export const initialState: State = {
  onlineUsersByWorkspaceId: {},
  onlineUsersByRoomId: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    syncOnlineUsers: (state, action: PayloadAction<PhoenixPresenceState>) => {
      const byWorkspaceId: { [workspaceId: string]: string[] } = {}
      const byRoomId: { [roomId: string]: string[] } = {}

      for (const key in action.payload) {
        const meta = action.payload[key].metas[0]
        if (!meta) {
          log.info('Missing meta in online presence row', key, action.payload)
          return
        }

        const userId = meta.user_id
        const workspaceId = meta.workspace_id
        const roomId = meta.room_id

        if (byWorkspaceId[workspaceId]) {
          byWorkspaceId[workspaceId].push(userId)
        } else {
          byWorkspaceId[workspaceId] = [userId]
        }

        if (byRoomId[roomId]) {
          byRoomId[roomId].push(userId)
        } else {
          byRoomId[roomId] = [userId]
        }
      }

      log.info(
        'Online users by workspace:',
        byWorkspaceId,
        'by rooms:',
        byRoomId
      )

      state.onlineUsersByRoomId = byRoomId
      state.onlineUsersByWorkspaceId = {
        ...state.onlineUsersByWorkspaceId,
        ...byWorkspaceId,
      }
    },
    setOnlineUsersByWorkspaceId: (
      state,
      action: PayloadAction<{ workspaceId: string; onlineUsers: string[] }>
    ) => {
      state.onlineUsersByWorkspaceId[action.payload.workspaceId] =
        action.payload.onlineUsers
    },
    setOnlineUsersByRoomId: (
      state,
      action: PayloadAction<{ roomId: string; onlineUsers: string[] }>
    ) => {
      state.onlineUsersByRoomId[action.payload.roomId] =
        action.payload.onlineUsers
    },
  },
})

export const {
  syncOnlineUsers,
  setOnlineUsersByWorkspaceId,
  setOnlineUsersByRoomId,
} = slice.actions
export default slice.reducer
