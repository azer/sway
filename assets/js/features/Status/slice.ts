import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'status'

export enum PresenceMode {
  Focus = 'focus',
  Active = 'active',
  Away = 'away',
  DoNotDisturb = 'do_not_disturb',
}

export interface PresenceStatus {
  userId: string
  message?: string
  mode: PresenceMode
}

export interface CallStatus {
  bafaUserId: string
  dailyUserId?: string
  sessionId?: string
  cameraOn?: boolean
  screenOn?: boolean
  micOn?: boolean
  cameraError?: boolean
  micError?: boolean
  soundError?: boolean
}

export enum ConnectionState {
  Ready = 'ready',
  Connecting = 'connecting',
  Successful = 'successful',
  Failed = 'failed',
  Timeout = 'timeout',
}

export interface ConnectionStatus {
  userId: string
  bafaSocket?: ConnectionState
  bafaRoom?: ConnectionState
  dailyRoom?: ConnectionState
}

interface State {
  call: { [userId: string]: CallStatus }
  presence: { [userId: string]: PresenceStatus }
  connection: { [userId: string]: ConnectionStatus }
}

export const initialState: State = {
  call: {},
  presence: {},
  connection: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setCallStatus: (
      state,
      action: PayloadAction<{ userId: string; status: CallStatus }>
    ) => {
      state.call[action.payload.userId] = action.payload.status
    },
    setBafaSocketConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        bafaSocket: action.payload.state,
      }
    },
    setBafaRoomConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        bafaRoom: action.payload.state,
      }
    },
    setDailyRoomConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        dailyRoom: action.payload.state,
      }
    },
    setPresenceStatus: (
      state,
      action: PayloadAction<{ userId: string; status: PresenceStatus }>
    ) => {
      state.presence[action.payload.userId] = action.payload.status
    },
    setPresenceAsActive: (state, action: PayloadAction<string>) => {
      state.presence[action.payload] = {
        ...state.presence[action.payload],
        mode: PresenceMode.Active,
      }
    },
    setPresenceAsFocus: (state, action: PayloadAction<string>) => {
      state.presence[action.payload] = {
        ...state.presence[action.payload],
        mode: PresenceMode.Focus,
      }
    },
    setPresenceAsAway: (state, action: PayloadAction<string>) => {
      state.presence[action.payload] = {
        ...state.presence[action.payload],
        mode: PresenceMode.Away,
      }
    },
    setPresenceAsDoNotDisturb: (state, action: PayloadAction<string>) => {
      state.presence[action.payload] = {
        ...state.presence[action.payload],
        mode: PresenceMode.DoNotDisturb,
      }
    },
  },
})

export const {
  setPresenceAsActive,
  setPresenceAsAway,
  setPresenceAsDoNotDisturb,
  setPresenceAsFocus,
  setCallStatus,
  setPresenceStatus,
  setBafaRoomConnectionStatus,
  setBafaSocketConnectionStatus,
  setDailyRoomConnectionStatus,
} = slice.actions
export default slice.reducer
