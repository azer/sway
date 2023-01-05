import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import {
  useDevices,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'
import logger from 'lib/log'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import { CameraOff, Prop, Table, Value } from './CallSettingsPreview'

interface Props {
  deviceId?: string
}

const log = logger('settings/video-preview')

export function VideoSettingsPreview(props: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [label] = useSelector((state) => [
    selectors.settings.getVideoInputDeviceLabelById(
      state,
      props.deviceId || ''
    ),
  ])

  useEffect(() => {
    async function getCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: props.deviceId },
        },
      })

      if (videoRef && videoRef.current) {
        videoRef.current.srcObject = stream
      }
    }

    getCamera()
  }, [props.deviceId, videoRef])

  return (
    <Container>
      {props.deviceId === 'off' ? (
        <CameraOff>
          <Icon name="video-off" />
        </CameraOff>
      ) : (
        <video autoPlay muted playsInline ref={videoRef} />
      )}
      <Table>
        <Prop>Camera:</Prop>
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
  '& video': {
    width: '100%',
    aspectRatio: '1.5 / 1',
    borderRadius: '$small',
    background: '$gray1',
    marginBottom: '8px',
    objectFit: 'cover',
  },
})
