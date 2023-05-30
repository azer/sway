import selectors from 'selectors'
import { RootState } from 'state'
import { DeviceInfo } from './slice'

export function getVideoInputDeviceId(state: RootState): string | undefined {
  return state.settings.videoInputDeviceId
}

export function allVideoInputDevices(state: RootState): DeviceInfo[] {
  return state.settings.videoInputDevices
}

export function getAudioInputDeviceId(state: RootState): string | undefined {
  return state.settings.audioInputDeviceId
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

export function allAudioOutputDevices(state: RootState): DeviceInfo[] {
  return state.settings.audioOutputDevices
}

export function getVideoInputDeviceLabelById(
  state: RootState,
  id: string
): string | undefined {
  return allVideoInputDevices(state).find((d) => d.id === id)?.label
}

export function getAudioInputDeviceLabelById(
  state: RootState,
  id: string
): string | undefined {
  return allAudioInputDevices(state).find((d) => d.id === id)?.label
}

export function getAudioOutputDeviceLabelById(
  state: RootState,
  id: string
): string | undefined {
  return allAudioOutputDevices(state).find((d) => d.id === id)?.label
}

export function isOnAirpods(state: RootState): boolean {
  const label = getAudioInputDeviceLabelById(
    state,
    getAudioInputDeviceId(state) || ''
  )
  return /airpod/i.test(label || '')
}

export function isPushToTalkVideoOn(state: RootState): boolean {
  return state.settings.pushToTalkVideo
}

export function getBackgroundColor(state: RootState): string | undefined {
  return state.settings.backgroundColor
}

export function getBackgroundBlurValue(state: RootState): number {
  return state.settings.backgroundBlur || 0
}

export function getBackgroundBlurLabel(state: RootState): string {
  if (state.settings.backgroundBlur === 0) {
    return 'Off'
  }

  return `${state.settings.backgroundBlur * 100}%`
}

export function isVideoInputOff(state: RootState): boolean {
  return !selectors.status.getLocalStatus(state)?.camera_on
}

export function isAudioInputOff(state: RootState): boolean {
  return !selectors.status.getLocalStatus(state)?.camera_on
}

export function isAudioOutputOff(state: RootState): boolean {
  return !selectors.status.getLocalStatus(state)?.camera_on
}
