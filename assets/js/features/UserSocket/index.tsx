import { entities, useSelector } from 'state'
import { syncOnline } from './slice'
import React, { useContext, useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { Socket, Presence, Channel } from 'phoenix'
import { useDispatch } from 'react-redux'
import { add, addBatch, Entity, Update } from 'state/entities'
import { logger } from 'lib/log'
import {
  ConnectionState,
  setSwaySocketConnectionStatus,
} from 'features/Dock/slice'
import { timezone } from 'lib/datetime'
import { APIResponseRow } from 'lib/api'
// import useUserSocket, { context, initialState } from './use-user-socket'
// import { useSelector, useDispatch } from 'app/state'

interface Props {
  children: React.ReactNode
}

const socket = new Socket('/socket', {
  params: { token: (window as any).initialState.session.token },
})

export const SocketContext = React.createContext<{
  socket: Socket
  channel?: Channel
  presence?: Presence
}>({ socket })

const log = logger('user-socket')

export function UserSocketProvider(props: Props) {
  const dispatch = useDispatch()
  const [channel, setChannel] = useState<Channel>()
  const [presence, setPresence] = useState<Presence>()
  const retryTimer = useRef<NodeJS.Timer | null>()

  const [userId, workspaceId, status, shouldReconnect] = useSelector(
    (state) => [
      selectors.session.getUserId(state),
      selectors.memberships.getSelfMembership(state)?.workspace_id,
      selectors.dock.getSelfConnectionStatus(state),
      selectors.usersocket.shouldReconnect(state),
    ]
  )

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

      channel.on('entities:update', (update) => {
        log.info('Received entity update', update)
        dispatch(add(update))
      })
    }
  }, [status?.swaySocket, channel?.state])

  useEffect(() => {
    if (!shouldReconnect || !userId) {
      return
    }

    let delay = 100

    if (retryTimer.current !== null) {
      clearTimeout(retryTimer.current)
      retryTimer.current = null
      delay = 3000
    }

    retryTimer.current = setTimeout(() => {
      retryTimer.current = null

      log.info('Retry...')

      dispatch(
        setSwaySocketConnectionStatus({
          userId,
          state: ConnectionState.Retry,
        })
      )

      socket.connect()
    }, delay)

    return () => {
      if (retryTimer.current !== null) {
        clearTimeout(retryTimer.current)
        retryTimer.current = null
      }
    }
  }, [shouldReconnect])

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
    log.info('Workspace channel created')
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
  }, [workspaceId, userId])

  return (
    <SocketContext.Provider value={ctx}>
      {props.children}
    </SocketContext.Provider>
  )
}

export function useUserSocket() {
  const dispatch = useDispatch()
  const ctx = useContext(SocketContext)

  return {
    ...ctx,
    fetchEntity,
  }

  function fetchEntity(schema: entities.Schema, id: string) {
    if (!ctx.channel) return

    log.info('Fetching entity', schema, id)

    ctx.channel
      .push('entities:fetch', { id, schema })
      .receive('ok', (row: APIResponseRow) => {
        log.info('Fetching entity done', id, schema, row)
        dispatch(add(row as Update))
      })
      .receive('error', (error) => {
        log.error('Failed to fetch entity')
      })
  }
}
