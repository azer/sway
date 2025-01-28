import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DeviceInfo, getDefaultDevices, getUserDevices } from 'lib/devices'
import { logger } from 'lib/log'
import { AppDispatch, RootState } from 'state'

const log = logger('settings/slice')

export const name = 'settings'

interface State {
  videoInputError?: boolean
  audioInputError?: boolean
  audioOutputError?: boolean
  videoInputDeviceId?: string
  audioInputDeviceId?: string
  audioOutputDeviceId?: string
  videoInputDevices: DeviceInfo[]
  audioInputDevices: DeviceInfo[]
  audioOutputDevices: DeviceInfo[]
  pushToTalkVideo: boolean
  backgroundBlur?: number
  backgroundColor?: string
  audioOnly: boolean
}

export const initialState: State = {
  audioOnly: false,
  pushToTalkVideo: true,
  videoInputDevices: [],
  audioInputDevices: [],
  audioOutputDevices: [],
  backgroundBlur: 0,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setVideoInputDeviceId: (state, action: PayloadAction<string>) => {
      state.videoInputDeviceId = action.payload
    },
    setAudioInputDeviceId: (state, action: PayloadAction<string>) => {
      state.audioInputDeviceId = action.payload
    },
    setAudioOutputDeviceId: (state, action: PayloadAction<string>) => {
      state.audioOutputDeviceId = action.payload
    },
    setVideoInputDevices: (state, action: PayloadAction<DeviceInfo[]>) => {
      state.videoInputDevices = action.payload
    },
    setAudioInputDevices: (state, action: PayloadAction<DeviceInfo[]>) => {
      state.audioInputDevices = action.payload
    },
    setAudioOutputDevices: (state, action: PayloadAction<DeviceInfo[]>) => {
      state.audioOutputDevices = action.payload
    },
    setPushToTalkVideo: (state, action: PayloadAction<boolean>) => {
      state.pushToTalkVideo = action.payload
    },
    setBackgroundBlur: (state, action: PayloadAction<number>) => {
      state.backgroundBlur = action.payload
    },
    setVideoInputError: (state, action: PayloadAction<boolean>) => {
      state.videoInputError = action.payload
    },
    setAudioInputError: (state, action: PayloadAction<boolean>) => {
      state.audioInputError = action.payload
    },
    setAudioOutputError: (state, action: PayloadAction<boolean>) => {
      state.audioOutputError = action.payload
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.backgroundColor = action.payload
    },
  },
})

export const {
  setAudioInputError,
  setAudioOutputError,
  setVideoInputError,
  setAudioInputDeviceId,
  setAudioOutputDeviceId,
  setVideoInputDeviceId,
  setAudioInputDevices,
  setAudioOutputDevices,
  setVideoInputDevices,
  setPushToTalkVideo,
  setBackgroundBlur,
} = slice.actions
export default slice.reducer

export function syncDevices() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    log.info('Sync devices')

    getDefaultDevices()
      .then(({ camera, mic }) => {
        if (camera) dispatch(setVideoInputDeviceId(camera))
        if (mic) dispatch(setAudioInputDeviceId(mic))
      })
      .catch((err) => {
        log.error('Unable to find out default devices', err)
        const state = getState()

        if (state.settings.videoInputDevices.length > 0)
          dispatch(
            setVideoInputDeviceId(state.settings.videoInputDevices[0].id)
          )
        if (state.settings.audioInputDevices.length > 0)
          dispatch(
            setVideoInputDeviceId(state.settings.audioInputDevices[0].id)
          )
      })

    getUserDevices()
      .then((userDevices) => {
        log.info('User devices', userDevices)

        dispatch(setVideoInputDevices(userDevices.cameras))
        dispatch(setAudioInputDevices(userDevices.mics))
        dispatch(setAudioOutputDevices(userDevices.speakers))
      })
      .catch((err) => {
        log.error('Can not get user devices', err)
      })
  }
}
