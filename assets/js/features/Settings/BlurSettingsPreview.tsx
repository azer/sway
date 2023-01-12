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
  const [waiting, setWaiting] = useState(false)

  const [isOff, deviceId, deviceLabel] = useSelector((state) => [
    selectors.settings.isVideoInputOff(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.getVideoInputDeviceLabelById(
      state,
      selectors.settings.getVideoInputDeviceId(state) || ''
    ),
  ])

  useEffect(() => {
    if (!call) return

    if (!call.localVideo()) {
      log.info('Turn on local video')
      call.setLocalVideo(true)
      call.setInputDevicesAsync({
        videoDeviceId: deviceId,
      })
    }

    return () => {
      log.info('Turn off local video')
      clearTimer()
      call.setLocalVideo(false)
      call.setInputDevicesAsync({
        videoSource: false,
      })
    }
  }, [call])

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
    if (!call || !props.value) return

    clearTimer()
    setWaiting(true)

    timerRef.current = setTimeout(async () => {
      log.info('Setting background blur', props.value)

      try {
        await call.updateInputSettings({
          video: {
            processor: {
              type: 'background-blur',
              config: { strength: props.value },
            },
          },
        })

        setWaiting(false)
      } catch (err) {
        log.info('Failed to generate preview', err)
        setWaiting(false)
      }
    }, 1000)
  }, [props.value])

  return (
    <Container>
      <Waiting visible={waiting}>Processing</Waiting>
      {isOff ? (
        <CameraOff>
          <Icon name="video-off" />
        </CameraOff>
      ) : (
        <video autoPlay muted playsInline ref={videoElement} />
      )}
      <Table>
        <Prop>Camera</Prop>
        <Value off={isOff}>{deviceLabel}</Value>
        <Prop>Blur</Prop>
        <Value off={props.value === 0}>
          {props.value === 0 ? 'Off' : Math.floor(props.value * 100) + '%'}
        </Value>
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
