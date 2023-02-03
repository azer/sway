import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { logger } from 'lib/log'
import { AppDispatch, RootState } from 'state'

const log = logger('settings/slice')

export const name = 'settings'

export interface DeviceInfo {
  id: string
  label: string
}

interface State {
  videoInputError?: boolean
  audioInputError?: boolean
  audioOutputError?: boolean
  videoInputOff: boolean
  audioInputOff: boolean
  audioOutputOff: boolean
  videoInputDeviceId?: string
  audioInputDeviceId?: string
  audioOutputDeviceId?: string
  videoInputDevices: DeviceInfo[]
  audioInputDevices: DeviceInfo[]
  audioOutputDevices: DeviceInfo[]
  pushToTalkVideo: boolean
  backgroundBlur: number
}

export const initialState: State = {
  videoInputOff: true,
  audioInputOff: true,
  audioOutputOff: false,
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
    setVideoInputOff: (state, action: PayloadAction<boolean>) => {
      state.videoInputOff = action.payload
    },
    setAudioInputOff: (state, action: PayloadAction<boolean>) => {
      state.audioInputOff = action.payload
    },
    setAudioOutputOff: (state, action: PayloadAction<boolean>) => {
      state.audioOutputOff = action.payload
    },
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
  },
})

export const {
  setAudioInputError,
  setAudioOutputError,
  setVideoInputError,
  setAudioInputDeviceId,
  setAudioInputOff,
  setAudioOutputDeviceId,
  setAudioOutputOff,
  setVideoInputDeviceId,
  setVideoInputOff,
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

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => {
          track.stop()

          const id = track.getSettings().deviceId

          if (track.kind === 'video' && id) {
            log.info('Default video device found', id)
            dispatch(setVideoInputDeviceId(id))
          }

          if (track.kind === 'audio' && id) {
            log.info('Default audio input device found', id)
            dispatch(setAudioInputDeviceId(id))
          }

          log.info('Stop media device', track)
        })
      })
      .catch((err) => {
        const state = getState()

        log.error(
          'Unable to access user media to find out default devices:',
          err,
          state.settings.videoInputDevices.length
        )

        if (state.settings.videoInputDevices.length > 0)
          dispatch(
            setVideoInputDeviceId(state.settings.videoInputDevices[0].id)
          )
        if (state.settings.audioInputDevices.length > 0)
          dispatch(
            setVideoInputDeviceId(state.settings.audioInputDevices[0].id)
          )
      })

    listDevices('videoinput').then((allCameras) => {
      log.info('All video video input devices', allCameras)
      dispatch(setVideoInputDevices(allCameras))
    })

    listDevices('audioinput').then((allMics) => {
      dispatch(setAudioInputDevices(allMics))
    })

    listDevices('audiooutput').then((allSpeakers) => {
      dispatch(setAudioOutputDevices(allSpeakers))
    })
  }
}

export function turnOnCamera() {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    log.info('Turning on camera')

    const state = getState()
    const currentDeviceId = state.settings.videoInputDeviceId
    if (!currentDeviceId && state.settings.videoInputDevices.length === 0) {
      return log.error(
        'Can not enable video. No video input devices.',
        currentDeviceId,
        state.settings.videoInputDevices
      )
    } else if (!currentDeviceId) {
      dispatch(setVideoInputDeviceId(state.settings.videoInputDevices[0].id))
    }

    dispatch(setVideoInputOff(false))
  }
}

async function listDevices(kind: MediaDeviceKind): Promise<DeviceInfo[]> {
  const all = await navigator.mediaDevices.enumerateDevices()
  const labels: Record<string, boolean> = {}

  return all
    .filter((device) => {
      if (labels[key(device.label)]) return false
      labels[key(device.label)] = true
      return device.kind === kind
    })
    .map((d) => {
      return { id: d.deviceId, label: d.label }
    })
}

function key(label: string): string {
  return label.replace(/^Default - /, '')
}
