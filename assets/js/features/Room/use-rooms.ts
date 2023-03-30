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
import { useNavigate } from 'react-router-dom'
import { Rooms } from 'state/entities'

const log = logger('rooms/use-rooms')

export function useRooms() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [localUser, workspace, roomIdMap] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.workspaces.getSelfWorkspace(state),
    state.entities[Rooms],
  ])

  return {
    enterById,
    enterBySlug,
  }

  function enterById(id: string) {
    log.info('Enter room by id', id)
    if (roomIdMap[id].is_private) {
      navigate(`/${workspace?.slug}/room/${id}/${roomIdMap[id].slug}`)
    } else {
      navigate(`/${workspace?.slug}/room/${roomIdMap[id].slug}`)
    }

    //dispatch(moveUserToRoom({ roomId: id, userId: localUser?.id || '' }))
    //dispatch(setFocusedRoomById(id))
  }

  function enterBySlug(slug: string) {
    if (!localUser) return

    log.info('Enter room by slug', slug)

    dispatch(
      setSwayRoomConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    dispatch(setFocusedRoomBySlug(slug))
  }
}
