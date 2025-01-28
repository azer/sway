import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { Select } from 'components/Select'
import Icon from 'components/Icon'
import {
  setAudioInputDeviceId,
  setAudioOutputDeviceId,
  setVideoInputDeviceId,
} from 'features/Settings/slice'
import { DailyProvider, useDevices } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'
import {
  StepButton,
  StepButtonset,
  StepContent,
  StepDesc,
  StepGrid,
  StepSection,
  StepTitle,
  Title,
} from 'components/Onboarding'
import { CurrentStep } from './CurrentStep'
import { OnboardingButtonset } from 'components/Onboarding/Buttonset'
import { CameraConfig, Preview } from './CustomizeCamera'
import { MicSettingsPreview } from 'features/Settings/MicSettingsPreview'
import { ChevronDownIcon } from 'components/Icon/ChevronDown'
import { styled } from '@stitches/react'

interface Props {
  done: () => void
  back?: () => void
}

const log = logger('onboarding/camera-switcher')

export function CustomizeAudio(props: Props) {
  const dispatch = useDispatch()

  const [mics, selectedMicId, speakers, selectedSpeakerId] = useSelector(
    (state) => [
      selectors.settings.allAudioInputDevices(state),
      selectors.settings.getAudioInputDeviceId(state),
      selectors.settings.allAudioOutputDevices(state),
      selectors.settings.getAudioOutputDeviceId(state),
    ]
  )

  return (
    <StepGrid>
      <StepSection>
        <StepContent>
          <CurrentStep />
          <StepTitle>Sound check</StepTitle>
          <StepDesc>
            Select your preferred microphone and speaker. Make sure you{`'`}re
            heard clearly and you hear others just as well.
          </StepDesc>
        </StepContent>
        <OnboardingButtonset done={props.done} back={props.back} label="Next" />
      </StepSection>
      <StepSection>
        <StepContent>
          <CameraConfig>
            <Preview>
              <MicSettingsPreview deviceId={selectedMicId} onboarding />
            </Preview>
            <Select.Root value={selectedMicId} onValueChange={handleMicChange}>
              <Select.Trigger>
                <SelectIcon>
                  <Icon name="mic" />
                </SelectIcon>
                <Select.Value placeholder="Select microphone" />
                <Select.Icon asChild>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content position="popper" side="bottom" sideOffset={0}>
                  <Select.Viewport>
                    <Select.Group>
                      <Select.Label>Your microphones</Select.Label>
                      {mics.map((device) => (
                        <Select.Item key={device.id} value={device.id}>
                          <Select.ItemText>{device.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            <Title>Speaker</Title>
            <Select.Root
              value={selectedSpeakerId}
              onValueChange={handleSpeakerChange}
            >
              <Select.Trigger>
                <SelectIcon>
                  <Icon name="speaker" />
                </SelectIcon>
                <Select.Value placeholder="Select speaker" />
                <Select.Icon asChild>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content position="popper" side="bottom" sideOffset={0}>
                  <Select.Viewport>
                    <Select.Group>
                      <Select.Label>Your speakers</Select.Label>
                      {speakers.map((device) => (
                        <Select.Item key={device.id} value={device.id}>
                          <Select.ItemText>{device.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </CameraConfig>
        </StepContent>
      </StepSection>
    </StepGrid>
  )

  function handleMicChange(deviceId: string) {
    dispatch(setAudioInputDeviceId(deviceId))
  }

  function handleSpeakerChange(deviceId: string) {
    dispatch(setAudioOutputDeviceId(deviceId))
  }
}

const SelectIcon = styled('div', {
  marginTop: '4px',
  marginRight: '8px',
  '& svg': {
    color: 'rgb(160, 160, 160) !important',
    width: '14px !important',
    height: '14px !important',
  },
})
