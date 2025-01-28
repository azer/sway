import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'call'

interface State {
  remoteParticipantIds: string[]
  localParticipantId?: string
  participantStatus: { [userId: string]: CallParticipantStatus }
  cameraError?: boolean
  micError?: boolean
  soundError?: boolean
}

export interface CallParticipantStatus {
  swayUserId: string
  dailyUserId?: string
  sessionId?: string
  cameraOn?: boolean
  screenOn?: boolean
  micOn?: boolean
  cameraError?: boolean
  micError?: boolean
  soundError?: boolean
}

export const initialState: State = {
  // @ts-ignore
  remoteParticipantIds: window.initialState.remoteParticipantIds || [],
  // @ts-ignore
  participantStatus: window.initialState.participantStatus || {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setLocalParticipantId: (state, action: PayloadAction<string>) => {
      state.localParticipantId = action.payload
    },
    setRemoteParticipantIds: (state, action: PayloadAction<string[]>) => {
      state.remoteParticipantIds = action.payload
    },
    setCameraError: (state, action: PayloadAction<boolean>) => {
      state.cameraError = action.payload
    },
    setParticipantStatus: (
      state,
      action: PayloadAction<{ userId: string; status: CallParticipantStatus }>
    ) => {
      state.participantStatus[action.payload.userId] = action.payload.status
    },
  },
})

export const {
  setLocalParticipantId,
  setRemoteParticipantIds,
  setCameraError,
  setParticipantStatus,
} = slice.actions
export default slice.reducer
