import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import {
  CameraOff as SpeakerOff,
  Prop,
  Table,
  Value,
} from './CallSettingsPreview'

interface Props {
  deviceId?: string
}

const log = logger('settings/audio-preview')

export function SpeakerSettingsPreview(props: Props) {
  const [playing, setPlaying] = useState(false)

  const [label] = useSelector((state) => [
    selectors.settings.getAudioInputDeviceLabelById(
      state,
      props.deviceId || ''
    ),
  ])

  return (
    <Container>
      {props.deviceId === 'off' ? (
        <SpeakerOff>
          <Icon name="speaker-off" />
        </SpeakerOff>
      ) : (
        <SpeakerOff onClick={playTestSound}>
          <Icon name="speaker-volume-high" />
          <Label>Play test sound</Label>
        </SpeakerOff>
      )}
      <Table>
        <Prop>Speakers</Prop>
        <Value off={props.deviceId === 'off'}>{label || props.deviceId}</Value>
      </Table>
    </Container>
  )

  function playTestSound() {
    // Create an oscillator node
    log.info('Playing test sound...')

    const audioContext = new AudioContext()
    //audioContext.destination.setSinkId(props.deviceId)

    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = 440

    // Create a gain node
    const gain = audioContext.createGain()
    gain.gain.value = 0.5

    // Connect the oscillator to the gain node
    oscillator.connect(gain)

    // Connect the gain node to the audio context destination
    gain.connect(audioContext.destination)

    // Start the oscillator
    oscillator.start()

    // Stop the oscillator after 2 seconds
    setTimeout(() => {
      log.info('Stopping test sound...')
      oscillator.stop()
    }, 2000)
  }
}

const Container = styled('div', {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  padding: '16px',
})

const Label = styled('div', {
  marginTop: '16px',
  label: true,
})
