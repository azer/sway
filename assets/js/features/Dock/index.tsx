import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { Mirror } from './Mirror'
import { PresenceModeButton } from './PresenceMode'
import { Button } from './Button'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { setParticipantStatus } from 'features/Call/slice'
import { useSettings } from 'features/Settings'
import { useVideoSettings } from 'features/Settings/VideoSettings'
import { useMicSettings } from 'features/Settings/MicSettings'
import { useSpeakerSettings } from 'features/Settings/SpeakerSettings'
import { PresenceMode, setPresenceAsActive } from './slice'
import { ScreenshareButton } from 'features/Screenshare/Provider'
import { useHotkeys } from 'react-hotkeys-hook'
import { setAudioInputOff, setVideoInputOff } from 'features/Settings/slice'

interface Props {
  roomId: string
}

const log = logger('dock')

export function Dock(props: Props) {
  const dispatch = useDispatch()
  const pushToTalkStopRef = useRef<NodeJS.Timer | null>(null)
  const [pushToTalk, setPushToTalk] = useState(false)
  const [mediaSettings, setMediaSettings] = useState({
    audioInputOff: false,
    videoInputOff: false,
  })

  const localParticipant = useLocalParticipant()
  const settings = useSettings()
  const cameraSettings = useVideoSettings()
  const micSettings = useMicSettings()
  const speakerSettings = useSpeakerSettings()

  const [
    localUser,
    isActive,
    isVideoOff,
    isMicOff,
    isSpeakerOff,
    isOnAirpods,
    pushToTalkVideo,
  ] = useSelector((state) => {
    const isActive =
      selectors.dock.getSelfPresenceStatus(state)?.mode === PresenceMode.Active

    return [
      selectors.users.getSelf(state),
      isActive,
      !isActive || selectors.settings.isVideoInputOff(state),
      !isActive || selectors.settings.isAudioInputOff(state),
      !isActive || selectors.settings.isAudioOutputOff(state),
      selectors.settings.isOnAirpods(state),
      selectors.settings.isPushToTalkVideoOn(state),
    ]
  })

  useHotkeys(
    'space',
    startPushToTalk,
    {
      preventDefault: true,
      keydown: true,
    },
    [isMicOff, isVideoOff, pushToTalkVideo]
  )

  useHotkeys(
    'space',
    delayStoppingPushToTalk,
    {
      preventDefault: true,
      keyup: true,
    },
    [pushToTalk, isMicOff, isVideoOff]
  )

  useEffect(() => {
    if (!localParticipant || !localUser) return

    log.info('Sync local participant props', localParticipant)

    dispatch(
      setParticipantStatus({
        userId: localUser.id,
        status: {
          dailyUserId: localParticipant.user_id,
          bafaUserId: localUser.id,
          sessionId: localParticipant?.session_id,
          cameraOn: localParticipant.video,
          screenOn: localParticipant.screen,
          micOn: localParticipant.audio,
        },
      })
    )
  }, [localParticipant])

  return (
    <Container>
      <Mirror />
      <Separator />
      <PresenceModeButton />
      <Separator group />
      {isActive ? (
        <>
          <Buttonset>
            <Button
              icon={isVideoOff ? 'video-off' : 'video'}
              label="Camera"
              onClick={cameraSettings.open}
              off={isVideoOff}
            />
            <Button
              icon={isMicOff ? 'mic-off' : isOnAirpods ? 'airpods' : 'mic'}
              label="Microphone"
              onClick={micSettings.open}
              off={isMicOff}
            />
            <ScreenshareButton />
            <Button
              icon={isSpeakerOff ? 'speaker-off' : 'speaker-volume-high'}
              label="Speaker"
              onClick={speakerSettings.open}
              off={isSpeakerOff}
            />
          </Buttonset>
          <Separator group />
        </>
      ) : null}
      <Button icon="sliders" label="Options" onClick={settings.open} />
    </Container>
  )

  function startPushToTalk() {
    if (!isActive || !isMicOff || pushToTalk) return

    setMediaSettings({ audioInputOff: isMicOff, videoInputOff: isVideoOff })
    setPushToTalk(true)
    dispatch(setAudioInputOff(false))

    if (pushToTalkVideo) {
      dispatch(setVideoInputOff(false))
    }
  }

  function delayStoppingPushToTalk() {
    pushToTalkStopRef.current = setTimeout(() => {
      stopPushToTalk()
      pushToTalkStopRef.current = null
    }, 1500)
  }

  function stopPushToTalk() {
    if (!pushToTalk) return

    setPushToTalk(false)
    dispatch(setAudioInputOff(mediaSettings.audioInputOff))
    dispatch(setVideoInputOff(mediaSettings.videoInputOff))
  }
}

const Container = styled('nav', {
  display: 'flex',
  color: '$dockFg',
  background: '$dockBg',
  border: '1px solid $dockBorderColor',
  round: 'xlarge',
  margin: '0 auto 20px auto',
  padding: '12px 12px',
  vcenter: true,
})

const Separator = styled('div', {
  width: '1px',
  height: 'calc(100% - 16px)',
  background: 'rgba(255, 255, 255, 0.05)',
  margin: '8px 12px',
  variants: {
    group: {
      true: {
        background: 'transparent',
        margin: '8px 4px',
      },
    },
  },
})

const Buttonset = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  gap: '16px',
  height: '48px',
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: '$large',
})
