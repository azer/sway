import {
  ConnectionState,
  setSwayRoomConnectionStatus,
} from 'features/Dock/slice'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import {
  appendRoomIdToWorkspace,
  moveUserToRoom,
  setFocusedRoomById,
  setFocusedRoomBySlug,
} from './slice'
import { useNavigate } from 'react-router-dom'
import {
  add,
  addBatch,
  Room,
  RoomMember,
  RoomMembers,
  Rooms,
  Row,
  Update,
} from 'state/entities'
import { APIResponse, POST } from 'lib/api'
import { addRoomMembers } from 'features/RoomMembers/slice'
import { setWorkspaceFocusRegion } from 'features/Workspace/slice'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import { openChatSidebar } from 'features/Sidebar/slice'
import { setFocusOnInput } from 'features/Chat/slice'

const log = logger('rooms/use-rooms')

export function useRooms() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [localUser, workspace, focusedRoomId, roomIdMap] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.workspaces.getSelfWorkspace(state),
      selectors.rooms.getFocusedRoomId(state),
      state.entities[Rooms],
    ]
  )

  return {
    enterById,
    enterBySlug,
    createPrivateRoom,
    createOrEnterPrivateRoom,
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

  function createOrEnterPrivateRoom(
    userId: string,
    privateRoomId: string | undefined,
    privateRoomSlug: string | undefined,
    focusOnMessageInput?: boolean
  ) {
    if (!workspace || !localUser)
      return log.error('Workspace / localuser undefined')
    if (privateRoomId === focusedRoomId) return

    if (focusOnMessageInput) {
      dispatch(openChatSidebar())
      // fixme
      setTimeout(() => {
        log.info('set focus on input')
        dispatch(setFocusOnInput())
      }, 500)
    }

    if (privateRoomId) {
      navigate(`/${workspace?.slug}/room/${privateRoomId}/${privateRoomSlug}`)
      return
    }

    createPrivateRoom(workspace?.id, [userId, localUser.id])
      .then((resp) => {
        const created = resp.result as Row<Room>
        navigate(`/${workspace?.slug}/room/${created.id}/${created.data.slug}`)
      })
      .catch((error) => {
        log.error('Failed to create private room', error)
      })
  }

  function createPrivateRoom(
    workspaceId: string,
    users: string[]
  ): Promise<APIResponse> {
    return new Promise((resolve, reject) => {
      return POST('/api/rooms', {
        body: {
          private_room: {
            workspace_id: workspaceId,
            users,
          },
        },
      })
        .then((resp) => {
          const created = resp.result as Row<Room>

          dispatch(addBatch(resp.links as Update[]))
          dispatch(add(created))

          const roomMembers = resp.links.filter((l) => l.schema === RoomMembers)
          dispatch(addRoomMembers(roomMembers as Row<RoomMember>[]))

          dispatch(
            appendRoomIdToWorkspace({
              workspaceId,
              roomId: created.id,
              privateRoom: true,
            })
          )

          resolve(resp)
        })
        .catch((err) => {
          log.error('Can not create private room', err)
          reject(err)
        })
    })
  }
}
