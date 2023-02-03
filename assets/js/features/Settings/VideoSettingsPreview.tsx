import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import { CameraOff, Prop, Table, Value } from './CallSettingsPreview'

interface Props {
  deviceId?: string
}

const log = logger('settings/video-preview')

export function VideoSettingsPreview(props: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const trackRef = useRef<MediaStreamTrack[]>([])

  const [label] = useSelector((state) => [
    selectors.settings.getVideoInputDeviceLabelById(
      state,
      props.deviceId || ''
    ),
  ])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: { exact: props.deviceId },
        },
      })
      .then((stream) => {
        trackRef.current.forEach((t) => {
          t.stop()
        })
        trackRef.current = []

        trackRef.current = stream.getTracks()

        if (videoRef && videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })

    return function () {
      log.info(
        'Closing video tracks for testing camera',
        props.deviceId,
        trackRef.current
      )
      trackRef.current.forEach((t) => {
        t.stop()
      })
      trackRef.current = []
    }
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
        <Prop>Camera</Prop>
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
    aspectRatio: '1.75 / 1',
    borderRadius: '$small',
    background: '$gray1',
    marginBottom: '8px',
    objectFit: 'cover',
  },
})
