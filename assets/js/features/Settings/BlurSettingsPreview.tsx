import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import { CameraOff, Prop, Table, Value } from './CallSettingsPreview'
import {
  useDaily,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'
import { useCommandPalette } from 'features/CommandPalette'

interface Props {
  value: number
}

const log = logger('settings/blur-preview')

export function BlurSettingsPreview(props: Props) {
  const call = useDaily()
  const localParticipant = useLocalParticipant()
  const videoTrack = useVideoTrack(localParticipant?.session_id || '')
  const videoElement = useRef()
  const timerRef = useRef<NodeJS.Timer | null>(null)
  const [previewValue, setPreviewValue] = useState(props.value)

  const [waiting, setWaiting] = useState(false)
  const [processing, setProcessing] = useState<number | undefined>(undefined)
  const [error, setError] = useState(false)
  const [delayedValue, setDelayedValue] =
    useState<number | undefined>(undefined)

  const [isOff, deviceId, deviceLabel] = useSelector((state) => [
    selectors.settings.isVideoInputOff(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.getVideoInputDeviceLabelById(
      state,
      selectors.settings.getVideoInputDeviceId(state) || ''
    ),
  ])

  const label = props.value === 0 ? 'Off' : Math.floor(props.value * 100) + '%'

  useEffect(() => {
    turnOnVideo()

    return () => {
      clearTimer()
      turnOffVideo()
    }
  }, [call])

  useEffect(() => {
    if (processing === undefined) {
      setPreviewValue(props.value)
    } else if (processing !== props.value) {
      log.info('Delay ', props.value)
      setDelayedValue(props.value)
    }
  }, [props.value])

  useEffect(() => {
    if (
      processing ||
      delayedValue === undefined ||
      previewValue === delayedValue
    )
      return

    log.info('Pick up next')
    setDelayedValue(undefined)
    setPreviewValue(delayedValue)
  }, [delayedValue, processing])

  useEffect(() => {
    if (!videoTrack.persistentTrack) return
    if (videoElement?.current) {
      // @ts-ignore
      videoElement.current.srcObject =
        videoTrack.persistentTrack &&
        new MediaStream([videoTrack?.persistentTrack])
    }
  }, [videoTrack.persistentTrack])

  useEffect(() => {
    if (!call) return

    clearTimer()
    setWaiting(true)
    setError(false)

    timerRef.current = setTimeout(
      async () => {
        log.info('Setting background blur', previewValue)

        setProcessing(previewValue)

        try {
          call.updateInputSettings({
            video: {
              processor:
                previewValue === 0
                  ? { type: 'none' }
                  : {
                      type: 'background-blur',
                      config: { strength: previewValue },
                    },
            },
          })
        } catch (err) {
          log.info('Failed to generate preview', err)
          setError(true)
        }

        setWaiting(false)
        setProcessing(undefined)
        turnOnVideo()
        log.info('Processing done', previewValue)
      },
      waiting ? 1500 : 0
    )
  }, [previewValue])

  return (
    <Container>
      <Waiting visible={waiting}>Processing</Waiting>
      {isOff ? (
        <CameraOff>
          <Icon name="video-off" />
        </CameraOff>
      ) : (
        <>
          <video autoPlay muted playsInline ref={videoElement} />
          <ZoomButton />
        </>
      )}
      <Table>
        <Prop>Blur</Prop>
        <Value off={props.value === 0 || error}>
          {error ? 'Error' : waiting ? 'Processing' : label}
        </Value>
        <Prop>Camera</Prop>
        <Value off={isOff}>{deviceLabel}</Value>
      </Table>
    </Container>
  )

  function clearTimer() {
    if (timerRef.current) {
      log.info('Clearing timer')
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function turnOnVideo() {
    if (!call || call.localVideo()) return

    log.info('Turn on local video')

    call.setLocalVideo(true)
    call.setInputDevicesAsync({
      videoDeviceId: deviceId,
    })
  }

  function turnOffVideo() {
    if (!call) return

    log.info('Turn off local video')
    videoTrack.persistentTrack?.stop()

    call.setLocalVideo(false)
    call.setInputDevicesAsync({
      videoSource: false,
    })
  }
}

const Container = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  padding: '16px',
  '& video': {
    width: '100%',
    aspectRatio: '1.75 / 1',
    borderRadius: '$small',
    background: '$gray1',
    marginBottom: '8px',
    objectFit: 'cover',
  },
})

const Waiting = styled('div', {
  position: 'absolute',
  width: 'calc(100% - 32px)',
  aspectRatio: '1.75 / 1',
  center: true,
  background: 'rgba(0, 0, 0, 0.1)',
  fontSize: '$small',
  color: '$white',
  fontWeight: '$medium',
  backdropFilter: 'blur(10px)',
  transition: 'width 1s ease-in-out',
  visibility: 'hidden',
  variants: {
    visible: {
      true: {
        visibility: 'visible',
      },
    },
  },
})

export function ZoomButton(props: {}) {
  const commandPalette = useCommandPalette()

  return (
    <ZoomButtonView title="Toggle zoom" onClick={toggleZoom}>
      <Icon name={commandPalette.fullScreen ? 'zoom-out' : 'zoom-in'} />
    </ZoomButtonView>
  )

  function toggleZoom() {
    commandPalette.setFullScreen(!commandPalette.fullScreen)
  }
}

const ZoomButtonView = styled('div', {
  position: 'absolute',
  right: '24px',
  top: '24px',
  width: '20px',
  height: '20px',
  color: 'rgba(255, 255, 255, 0.75)',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.95)',
  },
})
