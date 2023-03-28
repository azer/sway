import React, { useEffect, useRef, useState } from 'react'
import { receive, setStatusId, tap } from './slice'
import { useUserSocket } from 'features/UserSocket'
import { logger } from 'lib/log'
import { Status } from 'state/entities'
import selectors from 'selectors'
import { useHotkeys } from 'react-hotkeys-hook'
import { useSelector, useDispatch } from 'state'
import { usePresence } from './use-presence'

interface Props {
  children?: React.ReactNode
}

const log = logger('presence/provider')

export default function PresenceProvider(props: Props) {
  const { channel } = useUserSocket()
  const dispatch = useDispatch()
  const [receivedTap, setReceivedTap] = useState<string | undefined>(undefined)
  /*const pushToTalkStopRef = useRef<NodeJS.Timer | null>(null)
  const [pushToTalk, setPushToTalk] = useState(false)
  const [mediaSettings, setMediaSettings] = useState({
    audioInputOff: false,
    videoInputOff: false,
  })

  //const commandPalette = useCommandPalette()*/
  const presence = usePresence()

  const [localStatus, isActive, pushToTalkVideo, isSpaceButtonEnabled] =
    useSelector((state) => [
      selectors.statuses.getLocalStatus(state),
      selectors.presence.isLocalUserActive(state),
      selectors.settings.isPushToTalkVideoOn(state),
      selectors.presence.isSpaceButtonEnabled(state),
    ])

  useEffect(() => {
    if (!channel) return

    log.info('Listening user status updates')

    channel.on('user:status', (payload: Status) => dispatch(receive(payload)))
  }, [channel])

  useHotkeys(
    'space',
    toggle,
    {
      enabled: isSpaceButtonEnabled,
      preventDefault: true,
      keyup: true,
    },
    [channel, localStatus, isActive]
  )

  /*useHotkeys(
    'spacpfce',
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
