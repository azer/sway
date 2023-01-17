import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
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
import { ScreenshareButton } from 'features/Screenshare/Provider'
import { useHotkeys } from 'react-hotkeys-hook'
import { setAudioInputOff, setVideoInputOff } from 'features/Settings/slice'
import {
  add,
  Entity,
  PresenceMode,
  Statuses,
  toStateEntity,
} from 'state/entities'
import { isAudioInputOff } from 'features/Settings/selectors'
import { useUserSocket } from 'features/UserSocket'

interface Props {
  roomId: string
}

const log = logger('dock')

export function Dock(props: Props) {
  const dispatch = useDispatch()

  const localParticipant = useLocalParticipant()
  const settings = useSettings()
  const cameraSettings = useVideoSettings()
  const micSettings = useMicSettings()
  const speakerSettings = useSpeakerSettings()

  const [localUser, isCameraOff, isMicOff, isSpeakerOff, isOnAirpods] =
    useSelector((state) => {
      const status = selectors.presence.getSelfStatus(state)

      return [
        selectors.users.getSelf(state),
        !status?.is_active || selectors.settings.isVideoInputOff(state),
        !status?.is_active || selectors.settings.isAudioInputOff(state),
        !status?.is_active || selectors.settings.isAudioOutputOff(state),
        selectors.settings.isOnAirpods(state),
      ]
    })

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
      <Buttonset>
        <Button
          icon={isCameraOff ? 'video-off' : 'video'}
          label="Camera"
          onClick={cameraSettings.open}
          off={isCameraOff}
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
      <Button icon="sliders" label="Options" onClick={settings.open} />
    </Container>
  )
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
