import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import { logger } from 'lib/log'
import { Button, StyledButton } from './Button'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { setParticipantStatus } from 'features/Call/slice'

import {
  ConnectionState,
  setFocusAway,
  setFocusRegion,
  setInternetConnectionStatus,
} from './slice'

import {
  setAudioInputDeviceId,
  setAudioOutputDeviceId,
  setBackgroundBlur,
  setVideoInputDeviceId,
} from 'features/Settings/slice'
import { usePresence } from 'features/Presence/use-presence'
import { CallControls } from './CallControls'
import { StatusControls } from './StatusControls'
import { useEmojiSearch } from 'features/Emoji/use-emoji-search'
import { DockFocusRegion } from './focus'

interface Props {
  roomId: string
}

const log = logger('dock')

export function Dock(props: Props) {
  const dispatch = useDispatch()

  const localParticipant = useLocalParticipant()
  const presence = usePresence()

  const emojiSearch = useEmojiSearch()
  const [message, setMessage] = useState('')

  const [
    localUser,
    localPresence,
    isOnAirpods,
    allVideoInputDevices,
    selectedVideoInputDeviceId,
    allAudioInputDevices,
    selectedAudioInputDeviceId,
    allAudioOutputDevices,
    selectedAudioOutputDeviceId,
    blurValue,
    focus,
  ] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.statuses.getLocalStatus(state),
    selectors.settings.isOnAirpods(state),
    selectors.settings.allVideoInputDevices(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.allAudioInputDevices(state),
    selectors.settings.getAudioInputDeviceId(state),
    selectors.settings.allAudioOutputDevices(state),
    selectors.settings.getAudioOutputDeviceId(state),
    selectors.settings.getBackgroundBlurValue(state),
    selectors.dock.getFocus(state),
  ])

  useEffect(() => {
    if (!localParticipant || !localUser) return

    log.info('Sync local participant props', localParticipant)

    dispatch(
      setParticipantStatus({
        userId: localUser.id,
        status: {
          dailyUserId: localParticipant.user_id,
          swayUserId: localUser.id,
          sessionId: localParticipant?.session_id,
          cameraOn: localParticipant.video,
          screenOn: localParticipant.screen,
          micOn: localParticipant.audio,
        },
      })
    )
  }, [localParticipant])

  useEffect(() => {
    if (!localUser) return

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [localUser?.id])

  return (
    <Container>
      <StatusControls
        localUser={localUser}
        message={message}
        setMessage={setMessage}
        emojiResults={emojiSearch.results}
        emojiQuery={emojiSearch.query}
        setEmojiQuery={emojiSearch.setQuery}
        focus={focus}
        handleBlur={handleBlur}
        setFocusRegion={(region: DockFocusRegion) =>
          dispatch(setFocusRegion(region))
        }
      />
      <CallControls
        cameraOn={localPresence.camera_on}
        micOn={localPresence.mic_on}
        speakerOn={localPresence.speaker_on}
        selectedCameraId={selectedVideoInputDeviceId}
        selectedMicId={selectedAudioInputDeviceId}
        selectedSpeakerId={selectedAudioOutputDeviceId}
        selectCamera={changeVideoInputDevice}
        selectMic={changeAudioInputDevice}
        selectSpeaker={changeAudioOutputDevice}
        isOnAirpods={isOnAirpods}
        cameras={allVideoInputDevices}
        mics={allAudioInputDevices}
        speakers={allAudioOutputDevices}
        blurValue={blurValue}
        toggleBlur={toggleBlurValue}
        setCameraOn={(camera: boolean) => presence.setMedia({ camera })}
        setMicOn={(mic: boolean) => presence.setMedia({ mic })}
        setSpeakerOn={(speaker: boolean) => presence.setMedia({ speaker })}
      />
    </Container>
  )

  function handleOnline() {
    if (!localUser) return

    dispatch(
      setInternetConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connected,
      })
    )
  }

  function handleOffline() {
    if (!localUser) return

    dispatch(
      setInternetConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Disconnected,
      })
    )
  }

  function changeVideoInputDevice(id: string) {
    dispatch(setVideoInputDeviceId(id))
  }

  function changeAudioInputDevice(id: string) {
    dispatch(setAudioInputDeviceId(id))
  }

  function changeAudioOutputDevice(id: string) {
    dispatch(setAudioOutputDeviceId(id))
  }

  function toggleBlurValue(checked: boolean) {
    dispatch(setBackgroundBlur(checked ? 50 : 0))
  }

  function handleBlur() {
    console.log('handle blur')
    dispatch(setFocusAway())
  }
}

const Container = styled('nav', {
  position: 'absolute',
  bottom: '8px',
  width: '250px',
  color: '$dockFg',
  background: '$dockBg',
  border: '1px solid $dockBorderColor',
  round: 'large',
  boxShadow: 'rgb(0 0 0 / 10%) 0px 0 8px',
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
  [`& div[data-state=open] ${StyledButton}`]: {
    background: '$dockButtonHoverBg',
    color: '$dockButtonHoverFg',
    borderColor: 'rgba(255, 255, 255, 0.03),',
  },
})
