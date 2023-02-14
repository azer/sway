import React, { useEffect, useRef, useState } from 'react'
import { setStatusId } from './slice'
import { useUserSocket } from 'features/UserSocket'
import { useDispatch, useSelector } from 'state'
import { logger } from 'lib/log'
import {
  add,
  PresenceMode,
  Status,
  Statuses,
  toStateEntity,
} from 'state/entities'
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
    selectors.presence.getSelfStatus(state),
    selectors.presence.isLocalUserActive(state),
    selectors.settings.isPushToTalkVideoOn(state),
  ])

  /*useEffect(() => {
    if (mode === PresenceMode.Social && isCameraOff) {
      setMode(PresenceMode.Focus, roomId)
    }
  }, [mode, isCameraOff, roomId, workspaceId])

  useEffect(() => {
    if (isActive && isCameraOff) {
      setAsInactive()
    }
  }, [mode, isActive, isCameraOff, workspaceId])*/

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
      enabled:
        localStatus.status !== PresenceMode.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keyup: true,
    },
    [channel, localStatus, isActive]
  )

  useHotkeys(
    'space',
    startPushToTalk,
    {
      enabled:
        localStatus.status === PresenceMode.Solo && !commandPalette.isOpen,
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
        localStatus.status === PresenceMode.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keyup: true,
    },
    [channel, pushToTalk, localStatus]
  )

  return <></>

  function startPushToTalk() {
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
  }

  function toggle() {
    const turnOn = !isActive

    if (localStatus.status === PresenceMode.Social) {
      presence.setMedia({
        mic: turnOn,
      })
    } else {
      presence.setMedia({
        camera: turnOn,
        mic: turnOn,
      })
    }
  }
}
