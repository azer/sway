import {
  ConnectionState,
  setSwayRoomConnectionStatus,
} from 'features/Dock/slice'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import {
  moveUserToRoom,
  setFocusedRoomById,
  setFocusedRoomBySlug,
} from './slice'

const log = logger('rooms/use-rooms')

export function useRooms() {
  const dispatch = useDispatch()

  const [localUser] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.workspaces.getSelfWorkspace(state),
    selectors.rooms.getFocusedRoom(state),
    selectors.rooms.getPresentRoom(state),
  ])

  return {
    enterById,
    enterBySlug,
  }

  function enterById(id: string) {
    dispatch(moveUserToRoom({ roomId: id, userId: localUser?.id || '' }))
    dispatch(setFocusedRoomById(id))
  }

  function enterBySlug(slug: string) {
    if (!localUser) return

    dispatch(
      setSwayRoomConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    dispatch(setFocusedRoomBySlug(slug))
  }
}
