import { useUserSocket } from 'features/UserSocket'
import { logger } from 'lib/log'
import { notifications } from 'lib/notifications'
import { firstName } from 'lib/string'
import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'

interface Props {}

interface Tap {
  from: string
  to: string
  workspace_id: string
  room_id: string
}

const log = logger('tap/provider')

export function TapProvider(props: Props) {
  const socket = useUserSocket()
  const [lastTappingUserId, setLastTappingUserId] =
    useState<string | undefined>(undefined)

  const [localUser, tappingUser] = useSelector((state) => [
    selectors.users.getSelf(state),
    lastTappingUserId
      ? selectors.users.getById(state, lastTappingUserId)
      : undefined,
  ])

  useEffect(() => {
    if (!lastTappingUserId || !tappingUser) return

    log.info('Show notification for tap', lastTappingUserId)
    notifications.show({
      title: `${firstName(tappingUser.name)} tapped you`,
      body: 'Jump on Sway to start talking',
      icon: tappingUser.photoUrl,
      badge: tappingUser.photoUrl,
    })
  }, [lastTappingUserId, !!tappingUser])

  useEffect(() => {
    if (lastTappingUserId && !tappingUser) {
      log.info('Fetch tapping user via socket', lastTappingUserId)
      socket.fetchEntity(entities.Users, lastTappingUserId)
    }
  }, [lastTappingUserId, !!tappingUser])

  useEffect(() => {
    if (!socket.channel) return
    log.info('listen taps')
    socket.channel.on('users:tap', handleTap)
  }, [!!socket.channel])

  return <></>

  function handleTap(payload: Tap) {
    log.info('handle tap', payload)
    if (payload.to === localUser?.id) {
      log.info('Received a tap', payload)
      setLastTappingUserId(payload.from)
    }
  }
}
