import { styled } from '@stitches/react'
import { entities, useSelector } from 'state'
import { syncOnline } from './slice'
import React, { useContext, useEffect, useState } from 'react'
import selectors from 'selectors'
import { Socket, Presence, Channel } from 'phoenix'
import { useDispatch } from 'react-redux'
import { setAllRoomUserIds, setWorkspaceRoomIds } from 'features/Room/slice'
import { add, Entity, toStateEntity } from 'state/entities'
import { logger } from 'lib/log'
import {
  ConnectionState,
  setSwaySocketConnectionStatus,
} from 'features/Dock/slice'
import { timezone } from 'lib/datetime'
// import useUserSocket, { context, initialState } from './use-user-socket'
// import { useSelector, useDispatch } from 'app/state'

interface Props {
  children: React.ReactNode
}

const socket = new Socket('/socket', {
  params: { token: (window as any).initialState.session.token },
})

const context = React.createContext<{
  socket: Socket
  channel?: Channel
  presence?: Presence
}>({ socket })

const log = logger('user-socket')

export function UserSocketProvider(props: Props) {
  const dispatch = useDispatch()
  const [channel, setChannel] = useState<Channel>()
  const [presence, setPresence] = useState<Presence>()
  const [userId, workspaceId, status] = useSelector((state) => [
    selectors.session.getUserId(state),
    selectors.memberships.getSelfMembership(state)?.workspace_id,
    selectors.dock.getSelfConnectionStatus(state),
  ])

  const ctx = {
    channel,
    presence,
    socket,
  }

  useEffect(() => {
    log.info('Open connection')
    socket.connect()
  }, [])

  useEffect(() => {
    log.info('Connection status', {
      ...status,
      channel: channel?.state,
    })

    if (
      status?.swaySocket === ConnectionState.Connected &&
      channel?.state === 'joined'
    ) {
      log.info('Sync timezone:', timezone())

      channel.push('user:status', {
        workspace_id: workspaceId,
        timezone: timezone(),
      })
    }
  }, [status?.swaySocket, channel?.state])

  useEffect(() => {
    if (!workspaceId || !userId) return

    socket.onClose(() => {
      log.info('Socket is disconnected')

      dispatch(
        setSwaySocketConnectionStatus({
          userId,
          state: ConnectionState.Disconnected,
        })
      )
    })

    socket.onOpen(() => {
      // @ts-ignore
      log.info('Socket is connected')

      dispatch(
        setSwaySocketConnectionStatus({
          userId,
          state: ConnectionState.Connected,
        })
      )
    })

    dispatch(
      setSwaySocketConnectionStatus({
        userId,
        state: ConnectionState.Connecting,
      })
    )

    const channel = socket.channel('workspace:' + workspaceId)
    setChannel(channel)

    log.info('Join workspace channel', { workspaceId })

    channel
      .join()
      .receive('ok', (resp) => {
        log.info('Joined workspace channel', { workspaceId })

        dispatch(
          setSwaySocketConnectionStatus({
            userId,
            state: ConnectionState.Connected,
          })
        )
      })
      .receive('error', (resp) => {
        log.error('Failed to join workspace channel', resp)

        dispatch(
          setSwaySocketConnectionStatus({
            userId,
            state: ConnectionState.Failed,
          })
        )
      })
      .receive('timeout', () => {
        setSwaySocketConnectionStatus({
          userId,
          state: ConnectionState.Timeout,
        })
      })

    const presence = new Presence(channel)
    setPresence(presence)

    presence.onLeave((id) => {
      log.info(`User ${id} left`)
    })

    presence.onSync(() => {
      const all: { id: string; onlineAt: string }[] = []
      const rooms: { [id: string]: string[] } = {}

      presence.list((id, props) => {
        const last = props.metas[props.metas.length - 1]

        all.push({
          id: String(last.user_id),
          onlineAt: last.online_at,
        })

        if (last.room_id != undefined) {
          rooms[last.room_id] = (rooms[last.room_id] || []).concat([
            String(last.user_id),
          ])
        }
      })

      // dispatch(setAllRoomUserIds(rooms))
      dispatch(syncOnline(all))
      // dispatch(setWorkspaceRoomIds({ workspaceId, roomIds: rooms }))
    })
  }, [workspaceId, userId])

  return <context.Provider value={ctx}>{props.children}</context.Provider>
}

export function useUserSocket() {
  const dispatch = useDispatch()
  const ctx = useContext(context)

  return {
    ...ctx,
    fetchEntity,
  }

  function fetchEntity(entity: entities.Table, id: string) {
    if (!ctx.channel) return

    log.info('Fetching entity', entity, id)

    ctx.channel
      .push('entities:fetch', { id, entity })
      .receive('ok', (record: Entity) => {
        log.info('Fetching entity done', id, entity, record)

        dispatch(
          add({
            table: entity,
            id,
            record: toStateEntity(entity, record),
          })
        )
      })
  }
}
