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
import { setAudioInputOff, setVideoInputOff } from 'features/Settings/slice'
import { useCommandPalette } from 'features/CommandPalette'
import { useSelector, useDispatch } from 'state'

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

  const [mode, isActive, isCameraOff, isMicOff, pushToTalkVideo, roomId] =
    useSelector((state) => {
      const status = selectors.presence.getSelfStatus(state)
      return [
        status?.status,
        status?.is_active,
        selectors.settings.isVideoInputOff(state),
        !status?.is_active || selectors.settings.isAudioInputOff(state),
        selectors.settings.isPushToTalkVideoOn(state),
        status?.room_id,
      ]
    })

  useEffect(() => {
    if (mode === PresenceMode.Social && isCameraOff) {
      setMode(PresenceMode.Focus, roomId)
    }
  }, [mode, isCameraOff, roomId])

  useEffect(() => {
    if (isActive && isCameraOff) {
      setAsInactive()
    }
  }, [mode, isActive, isCameraOff])

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
    toggleMicAndCam,
    {
      enabled: mode !== PresenceMode.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keyup: true,
    },
    [channel, isActive, isMicOff, isCameraOff]
  )

  useHotkeys(
    'space',
    startPushToTalk,
    {
      enabled: mode === PresenceMode.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keydown: true,
    },
    [channel, isMicOff, isCameraOff, pushToTalkVideo]
  )

  useHotkeys(
    'space',
    delayStoppingPushToTalk,
    {
      enabled: mode === PresenceMode.Solo && !commandPalette.isOpen,
      preventDefault: true,
      keyup: true,
    },
    [channel, pushToTalk, isMicOff, isCameraOff]
  )

  return <></>

  function toggleMicAndCam() {
    if (!isActive) {
      setAsActive()
    } else {
      setAsInactive()
    }
  }

  function startPushToTalk() {
    if (!isActive || !isMicOff || pushToTalk) return

    setAsActive()
  }

  function delayStoppingPushToTalk() {
    pushToTalkStopRef.current = setTimeout(() => {
      stopPushToTalk()
      pushToTalkStopRef.current = null
    }, 1500)
  }

  function stopPushToTalk() {
    if (!pushToTalk) return
    setAsInactive()
  }

  function setAsActive() {
    setMediaSettings({ audioInputOff: isMicOff, videoInputOff: isCameraOff })
    setPushToTalk(true)
    dispatch(setAudioInputOff(false))

    if (pushToTalkVideo) {
      dispatch(setVideoInputOff(false))
    }

    publishActiveStatus(true)
  }

  function setAsInactive() {
    setPushToTalk(false)
    dispatch(setAudioInputOff(mediaSettings.audioInputOff))
    dispatch(setVideoInputOff(mediaSettings.videoInputOff))

    publishActiveStatus(false)
  }

  function publishActiveStatus(active: boolean) {
    channel?.push('user:status', {
      is_active: active,
    })
  }

  function setMode(newMode: PresenceMode, roomId: string) {
    log.info('set mode', newMode, roomId)
    channel?.push('user:status', {
      presence_mode: newMode,
      room_id: roomId,
    })
  }
}
