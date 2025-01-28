import { Room, Status, User, Workspace } from 'state/entities'
import { CallParticipantStatus } from 'features/Call/slice'
import { RoomStatus } from 'features/Room/selectors'

export type TrayWindowState = {
  focusedRoom?: Room
  focusedRoomStatus?: RoomStatus
  localUser?: User
  localStatus?: Status
  workspace?: Workspace
  participants?: {
    userId: string
    participant?: CallParticipantStatus
    user?: User
    status?: Status
    isOnline: boolean
    isActive: boolean
    isSelf: boolean
  }[]
}
