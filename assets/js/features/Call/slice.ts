import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'call'

interface State {
  remoteParticipantIds: string[]
  localParticipantId?: string
  cameraError?: boolean
  micError?: boolean
  soundError?: boolean
}

export const initialState: State = {
  remoteParticipantIds: [],
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
  },
})

export const {
  setLocalParticipantId,
  setRemoteParticipantIds,
  setCameraError,
} = slice.actions
export default slice.reducer
