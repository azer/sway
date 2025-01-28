import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { CallControls } from './CallControls'
import { useSelector, useDispatch } from 'state'
import { useStatus } from 'features/Status/use-status'
import { DockFocusRegion } from 'features/Dock/focus'
import { setFocusRegion } from 'features/Dock/slice'
import {
  setAudioInputDeviceId,
  setAudioOutputDeviceId,
  setBackgroundBlur,
  setVideoInputDeviceId,
} from 'features/Settings/slice'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { setParticipantStatus } from 'features/Call/slice'
import { logger } from 'lib/log'
import { ConnectionStatus } from 'features/Dock/ConnectionStatus'
import { useHotkeys } from 'react-hotkeys-hook'

interface Props {}

const log = logger('call-dock')

export function CallDock(props: Props) {
  const dispatch = useDispatch()
  const presence = useStatus()

  const localParticipant = useLocalParticipant()
  //const screenshare = useScreenShare()

  const [
    localUser,
    localStatus,
    isOnAirpods,
    allVideoInputDevices,
    selectedVideoInputDeviceId,
    allAudioInputDevices,
    selectedAudioInputDeviceId,
    allAudioOutputDevices,
    selectedAudioOutputDeviceId,
    blurValue,
    focus,
    isActive,
    isSharingScreen,
    spaceKbdEnabled,
  ] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.status.getLocalStatus(state),
    selectors.settings.isOnAirpods(state),
    selectors.settings.allVideoInputDevices(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.allAudioInputDevices(state),
    selectors.settings.getAudioInputDeviceId(state),
    selectors.settings.allAudioOutputDevices(state),
    selectors.settings.getAudioOutputDeviceId(state),
    selectors.settings.getBackgroundBlurValue(state),
    selectors.dock.getFocus(state),
    selectors.status.isLocalUserActive(state),
    selectors.screenshare.isScreenSharing(state),
    selectors.dock.isSpaceKbdEnabled(state),
  ])

  useHotkeys(
    'space',
    toggleCall,
    {
      enabled: spaceKbdEnabled,
      preventDefault: true,
      keyup: true,
    },
    [spaceKbdEnabled, isActive]
  )

  useEffect(() => {
    if (!localParticipant || !localUser) return

    log.info('Sync local participant props', localParticipant, isSharingScreen)

    dispatch(
      setParticipantStatus({
        userId: localUser.id,
        status: {
          dailyUserId: localParticipant.user_id,
          swayUserId: localUser.id,
          sessionId: localParticipant?.session_id,
          cameraOn: localParticipant.video,
          screenOn: isSharingScreen,
          micOn: localParticipant.audio,
        },
      })
    )
  }, [
    isSharingScreen,
    localParticipant?.video,
    localParticipant?.audio,
    localParticipant?.screen,
    localParticipant?.session_id,
    localParticipant?.user_id,
  ])

  return (
    <Container>
      <ConnectionStatus />
      <CallControls
        focus={focus}
        cameraOn={localStatus.camera_on}
        micOn={localStatus.mic_on}
        speakerOn={localStatus.speaker_on}
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
        isActive={isActive}
        joinCall={() => presence.join()}
        leaveCall={() => presence.leave()}
        setCameraOn={(camera: boolean) => presence.setMedia({ camera })}
        setMicOn={(mic: boolean) => presence.setMedia({ mic })}
        setSpeakerOn={(speaker: boolean) => presence.setMedia({ speaker })}
        setFocusRegion={(region: DockFocusRegion) =>
          dispatch(setFocusRegion(region))
        }
      />
    </Container>
  )

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

  function toggleCall() {
    log.info('User pressed space to toggle camera/mic')

    const turnOn = !isActive

    presence.setMedia({
      camera: false,
      mic: turnOn,
    })
  }
}

const Container = styled('div', {
  position: 'relative',
})
