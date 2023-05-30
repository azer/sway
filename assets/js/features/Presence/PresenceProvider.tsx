import React, { useEffect, useRef, useState } from 'react'
import { logger } from 'lib/log'
import { useUserSocket } from 'features/UserSocket'
import { useSelector, useDispatch } from 'state'
import selectors from 'selectors'
import { PhoenixPresenceState, syncOnlineUsers } from './slice'
import { syncOnlineUserStatuses } from 'features/Status/slice'
import { Channel } from 'phoenix'
import { ConnectionState } from 'features/Dock/slice'

interface Props {
  children?: React.ReactNode
}

const log = logger('presence/provider')

export function PresenceProvider(props: Props) {
  const dispatch = useDispatch()
  const { socket, channel } = useUserSocket()
  const [initialized, setInitialized] = useState(false)

  const [workspaceId, isConnected] = useSelector((state) => [
    selectors.workspaces.getSelfWorkspace(state)?.id,
    selectors.dock.getSelfConnectionStatus(state)?.internet ===
      ConnectionState.Connected,
  ])

  useEffect(() => {
    if (!channel || !workspaceId || !initialized) return

    if (isConnected) {
      log.info('Reconnected, fetch online users.')
      fetchOnlineUsers(channel, workspaceId)
    }

    channel.on('workspace:online_users', (online) => {
      log.info('online users:', online)
      dispatch(syncOnlineUsers(online))
      dispatch(syncOnlineUserStatuses(online))
    })
  }, [channel && workspaceId && initialized, isConnected])

  useEffect(() => {
    if (!channel || !workspaceId) return

    log.info('Mounted. Listen for presence_diff events.')

    socket.onMessage((msg) => {
      if (msg.event === 'phx_reply') return // too noisy

      log.info('New socket message:', msg, channel, workspaceId)

      if (msg.event === 'presence_diff' && channel && workspaceId) {
        fetchOnlineUsers(channel, workspaceId)
        return
      }
    })

    fetchOnlineUsers(channel, workspaceId)
  }, [!!channel && !!workspaceId])

  return <></>

  function fetchOnlineUsers(channel: Channel, workspaceId: string) {
    log.info('Fetching online users for workspace:', workspaceId)

    channel
      .push('presence:list', { workspace_id: workspaceId })
      .receive('ok', (online: PhoenixPresenceState) => {
        dispatch(syncOnlineUsers(online))
        dispatch(syncOnlineUserStatuses(online))
        setInitialized(true)
      })
      .receive('error', (error) => {
        log.error('can not list presence', error)
      })
  }
}
