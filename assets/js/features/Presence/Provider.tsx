import React, { useEffect, useRef, useState } from 'react'
import { setStatusId } from './slice'
import { useUserSocket } from 'features/UserSocket'
import { logger } from 'lib/log'
import { add, Status, Statuses, toStateEntity } from 'state/entities'
import selectors from 'selectors'
import { useHotkeys } from 'react-hotkeys-hook'
import { useCommandPalette } from 'features/CommandPalette'
import { useSelector, useDispatch } from 'state'
import { usePresence } from './use-presence'

interface Props {
  children?: React.ReactNode
}

const log = logger('presence/provider')

export default function PresenceProvider(props: Props) {
  const { channel } = useUserSocket()
  const dispatch = useDispatch()
  const pushToTalkStopRef = useRef<NodeJS.Timer | null>(null)
  const [pushToTalk, setPushToTalk] = useState(false)
  const [mediaSettings, setMediaSettings] = useState({
    audioInputOff: false,
    videoInputOff: false,
  })

  const commandPalette = useCommandPalette()
  const presence = usePresence()

  const [localStatus, isActive, pushToTalkVideo] = useSelector((state) => [
    selectors.statuses.getLocalStatus(state),
    selectors.presence.isLocalUserActive(state),
    selectors.settings.isPushToTalkVideoOn(state),
  ])

  useEffect(() => {
    if (!channel) return
    channel.on('user:status', (payload: Status) => {
      log.info('Received new user status', payload)

      dispatch(
        add({
          table: Statuses,
          id: payload.id,
          record: toStateEntity(Statuses, payload),
        })
      )

      dispatch(setStatusId({ userId: payload.user_id, statusId: payload.id }))
    })
  }, [channel])

  useHotkeys(
    'space',
    toggle,
    {
      enabled: !commandPalette.isOpen,
      preventDefault: true,
      keyup: true,
    },
    [channel, localStatus, isActive]
  )

  /*useHotkeys(
    'space',
    startPushToTalk,
    {
      enabled:
        localStatus.status === PresenceStatus.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keydown: true,
    },
    [channel, localStatus, pushToTalkVideo]
  )

  useHotkeys(
    'space',
    delayStoppingPushToTalk,
    {
      enabled:
        localStatus.status === PresenceStatus.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keyup: true,
    },
    [channel, pushToTalk, localStatus]
  )*/

  return <></>

  function toggle() {
    const turnOn = !isActive

    presence.setMedia({
      camera: turnOn,
      mic: turnOn,
    })
  }

  /*function startPushToTalk() {
    if (pushToTalk) return
    setPushToTalk(true)
    presence.setMedia({ camera: pushToTalkVideo, mic: true })
  }

  function delayStoppingPushToTalk() {
    pushToTalkStopRef.current = setTimeout(() => {
      stopPushToTalk()
      pushToTalkStopRef.current = null
    }, 1500)
  }

  function stopPushToTalk() {
    if (!pushToTalk) return
    presence.setMedia({ camera: false, mic: false })
    setPushToTalk(false)
  }*/
}
