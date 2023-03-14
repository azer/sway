import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { Dropdown } from 'components/DropdownMenu'
import { DeviceInfo } from 'features/Settings/slice'
import { Button } from '../Dock/Button'
import { useSettings } from 'features/Settings'
import { useVideoSettings } from 'features/Settings/VideoSettings'
import { useMicSettings } from 'features/Settings/MicSettings'
import { useSpeakerSettings } from 'features/Settings/SpeakerSettings'
import { ScreenshareButton } from 'features/Screenshare/Provider'
import { useBackgroundBlurSettings } from 'features/Settings/BackgroundBlur'
import { FocusRegion } from 'components/FocusRegion'
import { DockFocus, DockFocusRegion } from '../Dock/focus'

interface Props {
  cameraOn: boolean
  micOn: boolean
  speakerOn: boolean
  isOnAirpods: boolean
  cameras: DeviceInfo[]
  mics: DeviceInfo[]
  speakers: DeviceInfo[]
  blurValue: number
  focus?: DockFocus
  selectedCameraId: string | undefined
  selectedMicId: string | undefined
  selectedSpeakerId: string | undefined
  toggleBlur: (on: boolean) => void
  setCameraOn: (on: boolean) => void
  setMicOn: (on: boolean) => void
  setSpeakerOn: (on: boolean) => void
  selectCamera: (deviceId: string) => void
  selectMic: (deviceId: string) => void
  selectSpeaker: (deviceId: string) => void
  setFocusRegion: (r: DockFocusRegion) => void
}

export function CallControls(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const settings = useSettings()
  const cameraSettings = useVideoSettings()
  const micSettings = useMicSettings()
  const speakerSettings = useSpeakerSettings()
  const blurSettings = useBackgroundBlurSettings()

  return (
    <Container>
      <Dropdown.Menu>
        <Dropdown.Trigger>
          <Button
            icon={!props.cameraOn ? 'video-off' : 'video'}
            label="Camera"
            off={!props.cameraOn}
            tooltipLabel={props.cameraOn ? 'Turn off camera' : 'Turn on camera'}
            tooltipShortcut={['cmd', 'e']}
          />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Label>Camera</Dropdown.Label>
          {props.cameras.map((d) => (
            <Dropdown.Item
              key={d.id}
              label={d.label}
              icon={d.id === props.selectedCameraId ? 'checkmark' : ''}
              onClick={() => props.selectCamera(d.id)}
            />
          ))}
          <Dropdown.Separator />
          <Dropdown.Label>Status</Dropdown.Label>
          <Dropdown.Item
            icon={props.cameraOn ? 'checkmark' : ''}
            label="On"
            kbd={props.cameraOn ? ['Cmd', 'e'] : []}
            onClick={() => props.setCameraOn(true)}
          />
          <Dropdown.Item
            icon={!props.cameraOn ? 'checkmark' : ''}
            label="Off"
            kbd={!props.cameraOn ? ['Cmd', 'e'] : []}
            onClick={() => props.setCameraOn(false)}
          />
          <Dropdown.Separator />
          <Dropdown.Label>Filters</Dropdown.Label>
          <Dropdown.Switch
            icon="dots"
            label="Blur background"
            id="blur"
            checked={props.blurValue !== 0}
            onCheckedChange={props.toggleBlur}
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
            icon={
              !props.micOn ? 'mic-off' : props.isOnAirpods ? 'airpods' : 'mic'
            }
            label="Microphone"
            off={!props.micOn}
            tooltipLabel={props.micOn ? 'Turn off mic' : 'Turn on mic'}
            tooltipShortcut={['cmd', 'd']}
          />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Label>Microphone</Dropdown.Label>
          {props.mics.map((d) => (
            <Dropdown.Item
              key={d.id}
              label={d.label}
              icon={d.id === props.selectedMicId ? 'checkmark' : ''}
              onClick={() => props.selectMic(d.id)}
            />
          ))}
          <Dropdown.Separator />
          <Dropdown.Label>Status</Dropdown.Label>
          <Dropdown.Item
            icon={props.micOn ? 'checkmark' : ''}
            label="On"
            kbd={!props.micOn ? ['Cmd', 'd'] : []}
            onClick={() => props.setMicOn(true)}
          />
          <Dropdown.Item
            icon={!props.micOn ? 'checkmark' : ''}
            label="Off"
            kbd={props.micOn ? ['Cmd', 'd'] : []}
            onClick={() => props.setMicOn(false)}
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
            icon={!props.speakerOn ? 'speaker-off' : 'speaker-volume-high'}
            label="Speaker"
            onClick={speakerSettings.open}
            off={!props.speakerOn}
            tooltipLabel={
              props.speakerOn ? 'Turn off speaker' : 'Turn on speaker'
            }
            tooltipShortcut={['ctrl', 'm']}
          />
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Label>Speaker</Dropdown.Label>
          {props.speakers.map((d) => (
            <Dropdown.Item
              key={d.id}
              label={d.label}
              icon={d.id === props.selectedSpeakerId ? 'checkmark' : ''}
              onClick={() => props.selectSpeaker(d.id)}
            />
          ))}
          <Dropdown.Separator />
          <Dropdown.Label>Status</Dropdown.Label>
          <Dropdown.Item
            icon={props.speakerOn ? 'checkmark' : ''}
            label="On"
            kbd={!props.speakerOn ? ['control', 'm'] : []}
            onClick={() => props.setSpeakerOn(true)}
          />
          <Dropdown.Item
            icon={!props.speakerOn ? 'checkmark' : ''}
            label="Off"
            kbd={props.speakerOn ? ['control', 'm'] : []}
            onClick={() => props.setSpeakerOn(false)}
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
      <Button
        icon="sliders"
        label="Settings"
        tooltipLabel="Settings"
        tooltipShortcut={['opt', 's']}
      ></Button>
    </Container>
  )
}

export const DockSection = styled('div', {
  width: '100%',
  borderLeft: '2.5px solid transparent',
  variants: {
    focused: {
      true: {
        borderColor: '$dockFocusBorderColor',
        background: '$dockFocusSectionBg',
      },
    },
  },
})

const Container = styled('div', {
  display: 'flex',
  center: true,
  flexDirection: 'row',
  padding: '4px 4px',
  gap: '8px',
  //background: 'rgb(28, 31, 36)',
})
