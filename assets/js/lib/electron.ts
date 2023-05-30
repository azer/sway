import { MediaTrackState } from '@daily-co/daily-react-hooks/dist/hooks/useMediaTrack'
import { TrayWindowState } from 'features/ElectronTray'
import { StatusModeKey } from 'state/status'
import { logger } from './log'

const log = logger('electron')

const isNode = isRunningInElectron() && process?.type !== 'renderer'
let ipcRenderer: IpcRenderer | null =
  typeof window !== 'undefined' ? window.electronIpcRenderer : null

interface IpcRenderer {
  send: (chan: string, payload: unknown) => void
  on: (chan: string, cb: (event: Event, msg: ElectronMessage) => void) => void
  removeListener: (
    chan: string,
    cb: (event: Event, msg: string) => void
  ) => void
}

export const isElectron =
  !isNode && /electron/i.test(window.navigator.userAgent)

export enum ElectronWindow {
  WindowManager = 'window-manager',
  Main = 'main-window',
  Tray = 'tray-window',
  Pip = 'pip',
}

export interface ElectronMessage {
  target: ElectronWindow
  payload: ElectronPayload
}

export interface ElectronPayload {
  provideState?: {
    state: TrayWindowState
  }
  setCameraOn?: {
    on: boolean
  }
  setMicOn?: {
    on: boolean
  }
  setSpeakerOn?: {
    on: boolean
  }
  saveStatusModeKey?: {
    status: StatusModeKey
  }
  saveStatusEmoji?: {
    emoji: string | undefined
  }
  saveStatusMessage?: {
    message: string
  }
  sendVideoFrame?: {
    userId: string
    base64Image: string
  }
  setTrayIcon?: {
    image: string
    title: string
    tooltip: string
  }
  showNotification?: {
    title: string
    image: string
    tooltip: string
  }
  tap?: {
    userId: string
  }
  createStatusHook?: {
    targetUserId: string
  }
  sendTrack?: {
    userId: string
    track: MediaTrackState
  }
  newReleaseDownloaded?: {
    name: string
    notes: string
    version: string
  }
  updateAvailable?: {
    name: string
    notes: string
    version: string
  }
  quitAndInstallNewRelease?: true
  requestState?: true
  joinCall?: true
  leaveCall?: true
  showMainWindow?: true
  showTrayWindow?: true
  hideMainWindow?: true
  hideTrayWindow?: true
  trayWindowCreated?: true
  showPipWindow?: true
  hidePipWindow?: true
  isTrayWindowVisible?: boolean
  isPipWindowVisible?: boolean
  isMainWindowFocused?: boolean
  requestCameraAccess?: boolean
  requestMicAccess?: boolean
  requestScreenAccess?: boolean
  hasCameraAccess?: boolean
  hasMicAccess?: boolean
  hasScreenAccess?: boolean
  checkingForUpdate?: boolean
}

export const messageMainWindow = createMessageFn(ElectronWindow.Main)
export const messageTrayWindow = createMessageFn(ElectronWindow.Tray)
export const messagePipWindow = createMessageFn(ElectronWindow.Pip)
export const messageWindowManager = createMessageFn(
  ElectronWindow.WindowManager
)

export function sendMessage(chan: string, message: ElectronMessage) {
  if (isNode) throw Error('Not implemented for Node')
  if (!isElectron) return
  if (!ipcRenderer) {
    log.error('ipcRenderer is not available to renderer process.')
    return
  }

  log.info('Sending message', chan, message)

  ipcRenderer.send(chan, message)
}

export function setTray(options: {
  image: string
  title?: string
  tooltip?: string
}) {
  messageWindowManager({
    setTrayIcon: {
      image: options.image || '',
      title: options.title || '',
      tooltip: options.tooltip || '',
    },
  })
}

export function createMessageFn(
  target: ElectronWindow
): (p: ElectronPayload) => void {
  return (payload: ElectronPayload) => {
    return sendMessage('message', {
      target,
      payload,
    })
  }
}

function isRunningInElectron() {
  return (
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.electron !== 'undefined'
  )
}

export function getIpcRenderer() {
  return ipcRenderer
}

export function setIpcRenderer(renderer: IpcRenderer) {
  ipcRenderer = renderer
}
