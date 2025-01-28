import { logger } from './log'

const log = logger('devices')

export interface DeviceInfo {
  id: string
  label: string
}

export interface Devices {
  cameras: DeviceInfo[]
  mics: DeviceInfo[]
  speakers: DeviceInfo[]
}

export async function getUserDevices(): Promise<Devices> {
  const [cameras, mics, speakers] = await Promise.all([
    listDevices('videoinput'),
    listDevices('audioinput'),
    listDevices('audiooutput'),
  ])

  log.info('User devices.', cameras, mics, speakers)

  return {
    cameras,
    mics,
    speakers,
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

export function key(label: string): string {
  return label.replace(/^Default - /, '')
}

export async function getDefaultDevices(): Promise<{
  camera: string | undefined
  mic: string | undefined
}> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  })

  let cameraId: string | undefined = undefined
  let micId: string | undefined = undefined

  stream.getTracks().forEach((track) => {
    track.stop()

    const id = track.getSettings().deviceId

    if (track.kind === 'video' && id) {
      cameraId = id
    }

    if (track.kind === 'audio' && id) {
      micId = track.getSettings().deviceId
    }
  })

  log.info('Default devices. Camera: %s Mic: %s', cameraId, micId)

  return {
    camera: cameraId,
    mic: micId,
  }
}
