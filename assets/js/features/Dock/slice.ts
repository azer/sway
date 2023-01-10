import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'status'

export enum PresenceMode {
  Offline = 'offline',
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
  dailyCall?: ConnectionState
}

interface State {
  presence: { [userId: string]: PresenceStatus }
  connection: { [userId: string]: ConnectionStatus }
}

export const initialState: State = {
  presence: {},
  connection: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
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
    setDailyCallConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        dailyCall: action.payload.state,
      }
    },
    setPresenceStatus: (
      state,
      action: PayloadAction<{ userId: string; status: PresenceStatus }>
    ) => {
      state.presence[action.payload.userId] = action.payload.status
    },
    setPresenceMode: (
      state,
      action: PayloadAction<{ userId: string; mode: PresenceMode }>
    ) => {
      state.presence[action.payload.userId] = {
        ...state.presence[action.payload.userId],
        mode: action.payload.mode,
      }
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
  setPresenceStatus,
  setPresenceMode,
  setBafaRoomConnectionStatus,
  setBafaSocketConnectionStatus,
  setDailyCallConnectionStatus,
} = slice.actions
export default slice.reducer
