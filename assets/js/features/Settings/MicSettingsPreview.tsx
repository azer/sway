import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import Icon from 'components/Icon'
import { useSelector } from 'state'
import { CameraOff as MicOff, Prop, Table, Value } from './CallSettingsPreview'

interface Props {
  deviceId?: string
}

const log = logger('settings/audio-preview')

export function MicSettingsPreview(props: Props) {
  const [level, setLevel] = useState(0)
  const intervalRef = useRef<NodeJS.Timer | null>(null)
  const trackRef = useRef<MediaStreamTrack[]>([])

  const [label] = useSelector((state) => [
    selectors.settings.getAudioInputDeviceLabelById(
      state,
      props.deviceId || ''
    ),
  ])

  useEffect(() => {
    if (!props.deviceId) return
    if (trackRef.current.length > 0) {
      log.info(
        'Closing audio context for testing mic',
        props.deviceId,
        trackRef.current
      )
      trackRef.current.forEach((t) => {
        t.stop()
      })
      trackRef.current = []
    }

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          mandatory: {
            deviceId: props.deviceId,
            googEchoCancellation: false,
            googAutoGainControl: false,
            googNoiseSuppression: false,
            googHighpassFilter: false,
          },
        },
      })
      .then((stream) => {
        trackRef.current = stream.getAudioTracks()

        log.info('Creating test audio for microphone', props.deviceId)

        const audio = new AudioContext()
        const source = audio.createMediaStreamSource(stream)
        const analyser = audio.createAnalyser()
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const updateLevel = () => {
          analyser.getByteTimeDomainData(dataArray)
          const values = dataArray.reduce(
            (acc, cur) => acc + Math.abs(cur - 128),
            0
          )
          const average = values / dataArray.length
          setLevel(average)
        }

        intervalRef.current = setInterval(updateLevel, 250)
      })

    return () => {
      if (trackRef.current) {
        log.info('Closing audio context for testing mic', props.deviceId)
        trackRef.current.forEach((t) => {
          t.stop()
        })
        trackRef.current = []
      }

      if (intervalRef.current) {
        log.info('Clear up mic test interval')
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [props.deviceId])

  const bars = [0, 0.5, 0.75, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <Container>
      {props.deviceId === 'off' ? (
        <MicOff>
          <Icon name="mic-off" />
        </MicOff>
      ) : (
        <MicOff>
          <Icon name="mic" />
          <InputLevel>
            {bars.map((n) => (
              <Bar on={level > n} />
            ))}
          </InputLevel>
        </MicOff>
      )}
      <Table>
        <Prop>Microphone</Prop>
        <Value off={props.deviceId === 'off'}>{label || props.deviceId}</Value>
      </Table>
    </Container>
  )
}

const Container = styled('div', {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  padding: '16px',
})

const InputLevel = styled('div', {
  display: 'flex',
  gap: '4px',
  bottom: '16px',
  position: 'absolute',
})

const Bar = styled('div', {
  width: '8px',
  height: '12px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '$small',
  variants: {
    on: {
      true: {
        background: 'rgba(255, 255, 255, 0.75)',
      },
    },
  },
})
