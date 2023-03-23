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
import {
  addBatch,
  Membership,
  Memberships,
  Status,
  Statuses,
  toStateEntity,
} from 'state/entities'
import { setStatusIdBatch } from 'features/Presence/slice'

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
      .push('workspace:list_online_users', { workspace_id: workspace?.id })
      .receive('ok', syncOnlineUserStatuses)
      .receive('error', (error) => {
        log.error('Can not list online users', error)
      })

    log.info('list workspace memberships')

    channel
      .push('workspace:list_workspace_memberships', {
        workspace_id: workspace?.id,
      })
      .receive('ok', (resp: Membership[]) => {
        log.info('Set all workspace memberships', resp)
        dispatch(
          addBatch(
            resp.map((m) => ({
              id: m.id,
              table: Memberships,
              record: toStateEntity(Memberships, m),
            }))
          )
        )
      })
      .receive('error', (error) => {
        log.error('Can not list workspace memberships', error)
      })
  }, [channel, workspace, navigator.onLine])

  useEffect(() => {
    if (!channel) return
    channel.on('rooms:join', handleJoiningNewRoom)
  }, [channel])

  useEffect(() => {
    if (!channel) return
    channel.on('workspace:sync_online_user_statuses', syncOnlineUserStatuses)
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

  function syncOnlineUserStatuses(resp: { statuses: Status[] }) {
    const list = resp.statuses

    log.info('Sync online user statuses', list)

    const userRoomMap: { [id: string]: string[] } = {}
    const userStatusMap: { userId: string; statusId: string }[] = list.map(
      (s) => ({ userId: s.user_id, statusId: s.id })
    )

    for (const status of list) {
      if (userRoomMap[status.room_id]) {
        userRoomMap[status.room_id].push(status.user_id)
      } else {
        userRoomMap[status.room_id] = [status.user_id]
      }
    }

    dispatch(
      addBatch(
        list.map((s) => ({
          id: s.id,
          table: Statuses,
          record: toStateEntity(Statuses, s),
        }))
      )
    )

    dispatch(setAllRoomUserIds(userRoomMap))
    dispatch(setStatusIdBatch(userStatusMap))
  }
}
