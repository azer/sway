import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'status'

export enum ConnectionState {
  Ready = 'ready',
  Connecting = 'connecting',
  Connected = 'connected',
  Failed = 'failed',
  Timeout = 'timeout',
  Disconnected = 'disconnected',
}

export interface ConnectionStatus {
  userId: string
  internet: ConnectionState
  swaySocket?: ConnectionState
  swayRoom?: ConnectionState
  dailyCall?: ConnectionState
}

interface State {
  presence: { [userId: string]: string }
  connection: { [userId: string]: ConnectionStatus }
}

export const initialState: State = {
  presence: {},
  connection: {
    // @ts-ignore
    [window.initialState?.session.userId]: {
      // @ts-ignore
      userId: window.initialState?.session.userId,
      internet: navigator.onLine
        ? ConnectionState.Connected
        : ConnectionState.Disconnected,
    },
  },
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setSwaySocketConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        swaySocket: action.payload.state,
      }
    },
    setSwayRoomConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        swayRoom: action.payload.state,
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
    setInternetConnectionStatus: (
      state,
      action: PayloadAction<{ userId: string; state: ConnectionState }>
    ) => {
      state.connection[action.payload.userId] = {
        ...state.connection[action.payload.userId],
        userId: action.payload.userId,
        internet: action.payload.state,
      }
    },
    setStatusId: (
      state,
      action: PayloadAction<{ userId: string; statusId: string }>
    ) => {
      state.presence[action.payload.userId] = action.payload.statusId
    },
  },
})

export const {
  setStatusId,
  setSwayRoomConnectionStatus,
  setSwaySocketConnectionStatus,
  setDailyCallConnectionStatus,
  setInternetConnectionStatus,
} = slice.actions
export default slice.reducer
