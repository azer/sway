import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { useUserSocket } from 'features/UserSocket'
import { useNavigate } from 'react-router-dom'
import { setAllRoomUserIds } from './slice'
import {
  ConnectionState,
  setSwayRoomConnectionStatus,
} from 'features/Dock/slice'
import { useRooms } from './use-rooms'

const log = logger('room/provider')

interface Props {}

export function RoomNavigationProvider(props: Props) {
  const dispatch = useDispatch()
  const { channel } = useUserSocket()
  const navigate = useNavigate()
  const { enterById } = useRooms()

  const [localUser, workspace, focusedRoom, presentRoom] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.workspaces.getSelfWorkspace(state),
      selectors.rooms.getFocusedRoom(state),
      selectors.rooms.getPresentRoom(state),
    ]
  )

  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  useEffect(() => {
    if (!channel || !workspace || !navigator.onLine) return

    channel
      .push('workspace:list_users', { workspace_id: workspace?.id })
      .receive('ok', (resp: { [roomId: string]: string[] }) => {
        log.info('Set workspace users by rooms', resp)
        dispatch(setAllRoomUserIds(resp))
      })
  }, [channel, workspace, navigator.onLine])

  useEffect(() => {
    if (!channel) return
    channel.on('rooms:join', handleJoiningNewRoom)
  }, [channel])

  useEffect(() => {
    if (!channel) return
    channel.on('workspace:sync_users', (resp) => {
      log.info('Sync workspace users', resp)
      dispatch(setAllRoomUserIds(resp))
    })
  }, [channel])

  useEffect(() => {
    if (!focusedRoom || !channel || !localUser) return

    log.info('Focused room changed', focusedRoom.name)

    navigate(`/${workspace?.slug}/room/${focusedRoom.slug}`)

    channel.push('rooms:join', {
      id: focusedRoom?.id,
      workspace_id: workspace?.id,
    })
  }, [focusedRoom?.id, localUser?.id])

  useEffect(() => {
    if (!focusedRoom || !presentRoom || focusedRoom.id == presentRoom.id) return

    log.info(
      'Focused and present rooms are different.',
      focusedRoom.name,
      presentRoom.name
    )

    enterById(presentRoom.id)
    //dispatch(setFocusedRoomById(presentRoom.id))
  }, [focusedRoom?.id, presentRoom?.id])

  return <></>

  function handleJoiningNewRoom(payload: { id: string; user_id: string }) {
    log.info('handle joining new room', payload, focusedRoom)

    if (String(payload.user_id) === localUser?.id) {
      dispatch(
        setSwayRoomConnectionStatus({
          userId: localUser.id,
          state: ConnectionState.Connected,
        })
      )
    }
  }
}
