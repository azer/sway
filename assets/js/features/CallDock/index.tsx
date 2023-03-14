import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { CallControls } from './CallControls'
import { useSelector, useDispatch } from 'state'
import { usePresence } from 'features/Presence/use-presence'
import { DockFocusRegion } from 'features/Dock/focus'
import { setFocusRegion } from 'features/Dock/slice'
import {
  setAudioInputDeviceId,
  setAudioOutputDeviceId,
  setBackgroundBlur,
  setVideoInputDeviceId,
} from 'features/Settings/slice'

interface Props {}

export function CallDock(props: Props) {
  const dispatch = useDispatch()
  const presence = usePresence()

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

  return (
    <Container>
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
}

const Container = styled('div', {})
