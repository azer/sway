import { Room, Status, User } from 'state/entities'
import { CallParticipantStatus } from 'features/Call/slice'
import { RoomStatus } from 'features/Room/selectors'
import { PresenceMode, PresenceStatus } from 'state/presence'

export enum ElectronWindow {
  Main = 'to-main-window',
  Tray = 'to-tray-window',
}

export interface TrayWindowRequest {
  setWindowCreated?: {
    created: boolean
  }
  setWindowOpen?: {
    open: boolean
  }
  requestState?: boolean
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
  savePresenceStatus?: {
    status: PresenceStatus
  }
  saveStatusEmoji?: {
    emoji: string
  }
  saveStatusMessage?: {
    message: string
  }
  sendVideoFrame?: {
    userId: string
    base64Image: string
  }
  joinCall?: true
  leaveCall?: true
}

export type TrayWindowState = {
  focusedRoom?: Room
  focusedRoomStatus?: RoomStatus
  localUser?: User
  localStatus?: Status
  participants?: {
    userId: string
    participant?: CallParticipantStatus
    user?: User
    status?: Status
    isOnline: boolean
    isActive: boolean
  }[]
}
