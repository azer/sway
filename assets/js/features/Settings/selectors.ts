import { RootState } from 'state'
import { DeviceInfo } from './slice'

export function getVideoInputDeviceId(state: RootState): string | undefined {
  return state.settings.videoInputDeviceId
}

export function isVideoInputOff(state: RootState): boolean {
  return state.settings.videoInputOff
}

export function allVideoInputDevices(state: RootState): DeviceInfo[] {
  return state.settings.videoInputDevices
}

export function getAudioInputDeviceId(state: RootState): string | undefined {
  return state.settings.audioInputDeviceId
}

export function isAudioInputOff(state: RootState): boolean {
  return state.settings.audioInputOff
}

export function allAudioInputDevices(state: RootState): DeviceInfo[] {
  return state.settings.audioInputDevices
}

export function getAudioOutputDeviceId(state: RootState): string | undefined {
  return (
    state.settings.audioOutputDeviceId ||
    state.settings.audioOutputDevices[0]?.id
  )
}

export function isAudioOutputOff(state: RootState): boolean {
  return state.settings.audioOutputOff
}

export function allAudioOutputDevices(state: RootState): DeviceInfo[] {
  return state.settings.audioOutputDevices
}

export function getVideoInputDeviceLabelById(
  state: RootState,
  id: string
): string | undefined {
  return isVideoInputOff(state)
    ? 'Off'
    : allVideoInputDevices(state).find((d) => d.id === id)?.label
}

export function getAudioInputDeviceLabelById(
  state: RootState,
  id: string
): string | undefined {
  return isAudioInputOff(state)
    ? 'Off'
    : allAudioInputDevices(state).find((d) => d.id === id)?.label
}

export function getAudioOutputDeviceLabelById(
  state: RootState,
  id: string
): string | undefined {
  return isAudioOutputOff(state)
    ? 'Off'
    : allAudioOutputDevices(state).find((d) => d.id === id)?.label
}

export function isOnAirpods(state: RootState): boolean {
  const label = getAudioInputDeviceLabelById(
    state,
    getAudioInputDeviceId(state) || ''
  )
  return /airpod/i.test(label || '')
}
