import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import logger from 'lib/log'
import Mirror from './Mirror'
import PresenceModeView from './PresenceMode'
import Button from './Button'
import { PresenceMode } from './slice'
import { CommandType, useCommandRegistry } from 'features/CommandRegistry'
import {
  useAudioTrack,
  useDaily,
  useDevices,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'

interface Props {
  roomId: string
}

const log = logger('status-tray')

export default function StatusTray(props: Props) {
  // const dispatch = useDispatch()

  const { useRegister } = useCommandRegistry()
  const {
    cameras,
    setCamera,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker,
  } = useDevices()

  const callObject = useDaily()
  const localParticipant = useLocalParticipant()
  const localVideo = useVideoTrack(localParticipant?.session_id || '')
  const localAudio = useAudioTrack(localParticipant?.session_id || '')

  const [isActive] = useSelector((state) => [
    selectors.status.getSelfPresenceStatus(state)?.mode === PresenceMode.Active,
  ])

  useRegister(
    (register) => {
      register(`Turn off camera`, () => callObject?.setLocalVideo(false), {
        icon: 'video-off',
        type: CommandType.Settings,
        when: !localVideo.isOff,
      })

      register(`Turn on camera`, () => callObject?.setLocalVideo(true), {
        icon: 'video',
        type: CommandType.Settings,
        when: localVideo.isOff,
      })

      register(`Turn on microphone`, () => callObject?.setLocalAudio(true), {
        icon: 'mic',
        type: CommandType.Settings,
        when: localAudio.isOff,
      })

      register(`Turn off microphone"`, () => callObject?.setLocalAudio(false), {
        icon: 'mic-off',
        type: CommandType.Settings,
        when: !localAudio.isOff,
      })

      for (const cam of cameras) {
        cameraCmd(cam.device.deviceId, cam.device.label, cam.selected)
      }

      for (const mic of microphones) {
        micCmd(mic.device.deviceId, mic.device.label, mic.selected)
      }

      for (const speaker of speakers) {
        speakerCmd(
          speaker.device.deviceId,
          speaker.device.label,
          speaker.selected
        )
      }

      function cameraCmd(id: string, label: string, selected: boolean) {
        register(`Switch camera to "${label}"`, () => setCamera(id), {
          id: 'switch-camera-' + id,
          icon: 'video',
          type: CommandType.Settings,
          when: selected !== true,
        })
      }

      function micCmd(id: string, label: string, selected: boolean) {
        register(`Switch microphone to "${label}"`, () => setMicrophone(id), {
          id: 'switch-mic-' + id,
          icon: label.toLowerCase().includes('airpods') ? 'airpods' : 'mic',
          type: CommandType.Settings,
          when: selected !== true,
        })
      }

      function speakerCmd(id: string, label: string, selected: boolean) {
        register(`Switch speaker to "${label}"`, () => setSpeaker(id), {
          id: 'switch-speaker-' + id,
          icon: label.toLowerCase().includes('airpods') ? 'airpods' : 'speaker',
          type: CommandType.Settings,
          when: selected !== true,
        })
      }
    },
    [cameras, setCamera, microphones, setMicrophone, callObject]
  )

  return (
    <Container>
      <Mirror />
      <Separator />
      <PresenceModeView />
      <Separator group />
      <Button icon="sliders" label="Options" />
    </Container>
  )
}

const Container = styled('nav', {
  display: 'flex',
  color: '$statusTrayFg',
  background: '$statusTrayBg',
  border: '1px solid $statusTrayBorderColor',
  round: 'xlarge',
  margin: '0 auto 20px auto',
  padding: '12px 12px',
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
