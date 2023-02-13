import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import { logger } from 'lib/log'
import { Mirror } from './Mirror'
import { PresenceModeButton } from './PresenceMode'
import { Button, StyledButton } from './Button'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { setParticipantStatus } from 'features/Call/slice'
import { useSettings } from 'features/Settings'
import { useVideoSettings } from 'features/Settings/VideoSettings'
import { useMicSettings } from 'features/Settings/MicSettings'
import { useSpeakerSettings } from 'features/Settings/SpeakerSettings'
import { ScreenshareButton } from 'features/Screenshare/Provider'
import {
  add,
  Entity,
  PresenceMode,
  Statuses,
  toStateEntity,
} from 'state/entities'
import { ConnectionState, setInternetConnectionStatus } from './slice'
import { Dropdown } from 'components/DropdownMenu'
import {
  setAudioInputDeviceId,
  setAudioInputOff,
  setAudioOutputDeviceId,
  setAudioOutputOff,
  setBackgroundBlur,
  setVideoInputDeviceId,
  setVideoInputOff,
} from 'features/Settings/slice'
import { useBackgroundBlurSettings } from 'features/Settings/BackgroundBlur'
import { usePresenceSettings } from 'features/Settings/PresenceSettings'
import { useUserSocket } from 'features/UserSocket'
import { usePresence } from 'features/Presence/use-presence'

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
  const blurSettings = useBackgroundBlurSettings()
  const presenceSettings = usePresenceSettings()
  const presence = usePresence()

  const [
    localUser,
    localPresence,
    workspaceId,
    isCameraOn,
    isMicOn,
    isSpeakerOn,
    isOnAirpods,
    allVideoInputDevices,
    selectedVideoInputDeviceId,
    allAudioInputDevices,
    selectedAudioInputDeviceId,
    allAudioOutputDevices,
    selectedAudioOutputDeviceId,
    blurValue,
  ] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.presence.getSelfStatus(state),
    selectors.memberships.getSelfMembership(state)?.workspace_id,
    selectors.dock.isVideoInputOn(state),
    selectors.dock.isAudioInputOn(state),
    selectors.dock.isAudioOutputOn(state),
    selectors.settings.isOnAirpods(state),
    selectors.settings.allVideoInputDevices(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.allAudioInputDevices(state),
    selectors.settings.getAudioInputDeviceId(state),
    selectors.settings.allAudioOutputDevices(state),
    selectors.settings.getAudioOutputDeviceId(state),
    selectors.settings.getBackgroundBlurValue(state),
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
      <Mirror />
      <Separator />
      <Dropdown.Menu>
        <Dropdown.Trigger>
          <PresenceModeButton />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Label>Choose your flow</Dropdown.Label>
          <Dropdown.Item
            icon={localPresence.is_active ? 'checkmark' : ''}
            label="Active"
            kbd={!localPresence.is_active ? ['Space'] : []}
            onClick={() =>
              presence.setActive(!localPresence.is_active, workspaceId || '')
            }
          />
          {presence.modes.map((p) => (
            <Dropdown.Item
              icon={
                localPresence.status === p && !localPresence.is_active
                  ? 'checkmark'
                  : ''
              }
              label={p}
              onClick={() =>
                presence.setMode(p, localPresence.room_id, workspaceId || '')
              }
            />
          ))}
          <Dropdown.Separator />
          <Dropdown.Item
            icon="sliders"
            label="Presence settings"
            onClick={presenceSettings.open}
          />
        </Dropdown.Content>
      </Dropdown.Menu>
      <Separator group />
      <Buttonset>
        <Dropdown.Menu>
          <Dropdown.Trigger>
            <Button
              icon={!isCameraOn ? 'video-off' : 'video'}
              label="Camera"
              off={!isCameraOn}
              tooltipLabel={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              tooltipShortcut={['cmd', 'e']}
            />
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Label>Camera</Dropdown.Label>
            {allVideoInputDevices.map((d) => (
              <Dropdown.Item
                label={d.label}
                icon={d.id === selectedVideoInputDeviceId ? 'checkmark' : ''}
                onClick={changeVideoInputDevice(d.id)}
              />
            ))}
            <Dropdown.Separator />
            <Dropdown.Label>Status</Dropdown.Label>
            <Dropdown.Item
              icon={isCameraOn ? 'checkmark' : ''}
              label="On"
              kbd={!isCameraOn ? ['Cmd', 'e'] : []}
              onClick={changeVideoInputStatus(true)}
            />
            <Dropdown.Item
              icon={!isCameraOn ? 'checkmark' : ''}
              label="Off"
              kbd={isCameraOn ? ['Cmd', 'e'] : []}
              onClick={changeVideoInputStatus(false)}
            />
            <Dropdown.Separator />
            <Dropdown.Label>Filters</Dropdown.Label>
            <Dropdown.Switch
              icon="dots"
              label="Blur background"
              id="blur"
              checked={blurValue !== 0}
              onCheckedChange={toggleBlurValue}
            />
            <Dropdown.Item label="Customize blur" onClick={blurSettings.open} />
            <Dropdown.Separator />
            <Dropdown.Item
              label="Camera settings"
              icon="sliders"
              onClick={cameraSettings.open}
            />
          </Dropdown.Content>
        </Dropdown.Menu>
        <Dropdown.Menu>
          <Dropdown.Trigger>
            <Button
              icon={!isMicOn ? 'mic-off' : isOnAirpods ? 'airpods' : 'mic'}
              label="Microphone"
              off={!isMicOn}
              tooltipLabel={isMicOn ? 'Turn off mic' : 'Turn on mic'}
              tooltipShortcut={['cmd', 'd']}
            />
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Label>Microphone</Dropdown.Label>
            {allAudioInputDevices.map((d) => (
              <Dropdown.Item
                label={d.label}
                icon={d.id === selectedAudioInputDeviceId ? 'checkmark' : ''}
                onClick={changeAudioInputDevice(d.id)}
              />
            ))}
            <Dropdown.Separator />
            <Dropdown.Label>Status</Dropdown.Label>
            <Dropdown.Item
              icon={isMicOn ? 'checkmark' : ''}
              label="On"
              kbd={!isMicOn ? ['Cmd', 'd'] : []}
              onClick={changeAudioInputStatus(true)}
            />
            <Dropdown.Item
              icon={!isMicOn ? 'checkmark' : ''}
              label="Off"
              kbd={isMicOn ? ['Cmd', 'd'] : []}
              onClick={changeAudioInputStatus(false)}
            />
            <Dropdown.Separator />
            <Dropdown.Item
              label="Microphone settings"
              icon="sliders"
              onClick={micSettings.open}
            />
          </Dropdown.Content>
        </Dropdown.Menu>
        <ScreenshareButton />
        <Dropdown.Menu>
          <Dropdown.Trigger>
            <Button
              icon={!isSpeakerOn ? 'speaker-off' : 'speaker-volume-high'}
              label="Speaker"
              onClick={speakerSettings.open}
              off={!isSpeakerOn}
              tooltipLabel={
                isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'
              }
              tooltipShortcut={['ctrl', 'm']}
            />
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Label>Speaker</Dropdown.Label>
            {allAudioOutputDevices.map((d) => (
              <Dropdown.Item
                label={d.label}
                icon={d.id === selectedAudioOutputDeviceId ? 'checkmark' : ''}
                onClick={changeAudioOutputDevice(d.id)}
              />
            ))}
            <Dropdown.Separator />
            <Dropdown.Label>Status</Dropdown.Label>
            <Dropdown.Item
              icon={isSpeakerOn ? 'checkmark' : ''}
              label="On"
              kbd={!isSpeakerOn ? ['control', 'm'] : []}
              onClick={changeAudioOutputStatus(true)}
            />
            <Dropdown.Item
              icon={!isSpeakerOn ? 'checkmark' : ''}
              label="Off"
              kbd={isSpeakerOn ? ['control', 'm'] : []}
              onClick={changeAudioOutputStatus(false)}
            />
            <Dropdown.Separator />
            <Dropdown.Item
              label="Speaker settings"
              icon="sliders"
              onClick={speakerSettings.open}
            />
          </Dropdown.Content>
        </Dropdown.Menu>
        <ScreenshareButton />
      </Buttonset>
      <Separator group />
      <Button
        icon="sliders"
        label="Options"
        onClick={settings.open}
        tooltipLabel="Settings"
        tooltipShortcut={['Cmd', 's']}
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
    return function () {
      dispatch(setVideoInputDeviceId(id))
    }
  }

  function changeVideoInputStatus(on: boolean) {
    return function () {
      dispatch(setVideoInputOff(!on))
    }
  }

  function changeAudioInputDevice(id: string) {
    return function () {
      dispatch(setAudioInputDeviceId(id))
    }
  }

  function changeAudioInputStatus(on: boolean) {
    return function () {
      dispatch(setAudioInputOff(!on))
    }
  }

  function changeAudioOutputDevice(id: string) {
    return function () {
      dispatch(setAudioOutputDeviceId(id))
    }
  }

  function changeAudioOutputStatus(on: boolean) {
    return function () {
      dispatch(setAudioOutputOff(!on))
    }
  }

  function toggleBlurValue(checked: boolean) {
    dispatch(setBackgroundBlur(checked ? 50 : 0))
  }

  function changePresenceMode(mode: PresenceMode) {
    return function () {
      //dispatch(setPresence)
    }
  }

  function switchToActiveMode() {}
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
  [`& div[data-state=open] ${StyledButton}`]: {
    background: '$dockButtonHoverBg',
    color: '$dockButtonHoverFg',
    borderColor: 'rgba(255, 255, 255, 0.03),',
  },
})
