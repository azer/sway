import { styled } from '@stitches/react'
import { entities, useSelector } from 'state'
import { syncOnline } from './slice'
import React, { useContext, useEffect, useState } from 'react'
import selectors from 'selectors'
import { Socket, Presence, Channel } from 'phoenix'
import { useDispatch } from 'react-redux'
import { syncAllRoomUsers } from 'features/Room/slice'
import { add, Entity, toStateEntity } from 'state/entities'
import logger from 'lib/log'
import {
  ConnectionState,
  setBafaSocketConnectionStatus,
} from 'features/Dock/slice'
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

export default function UserSocket(props: Props) {
  const dispatch = useDispatch()
  const [channel, setChannel] = useState<Channel>()
  const [presence, setPresence] = useState<Presence>()
  const [userId, orgId] = useSelector((state) => [
    selectors.session.getUserId(state),
    selectors.orgs.getSelfOrg(state)?.id,
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
    if (!orgId || !userId) return

    dispatch(
      setBafaSocketConnectionStatus({
        userId,
        state: ConnectionState.Connecting,
      })
    )

    const channel = socket.channel('org:' + orgId)
    setChannel(channel)

    log.info('Join org-wide channel', { orgId })

    channel
      .join()
      .receive('ok', (resp) => {
        log.info('Joined org channel', { orgId })

        dispatch(
          setBafaSocketConnectionStatus({
            userId,
            state: ConnectionState.Successful,
          })
        )
      })
      .receive('error', (resp) => {
        log.error('Failed to join org channel', resp)

        dispatch(
          setBafaSocketConnectionStatus({
            userId,
            state: ConnectionState.Failed,
          })
        )
      })
      .receive('timeout', () => {
        setBafaSocketConnectionStatus({
          userId,
          state: ConnectionState.Timeout,
        })
      })

    const presence = new Presence(channel)
    setPresence(presence)

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

      dispatch(syncOnline(all))
      dispatch(syncAllRoomUsers(rooms))
    })
  }, [orgId, userId])

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
