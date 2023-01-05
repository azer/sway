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

interface Props {
  deviceId?: string
}

const log = logger('settings/video-preview')

export function CallSettingsPreview(props: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [
    isVideoOff,
    videoDeviceId,
    videoDeviceLabel,
    isMicOff,
    micDeviceId,
    micDeviceLabel,
    isSpeakerOff,
    speakerDeviceId,
    speakerDeviceLabel,
  ] = useSelector((state) => [
    selectors.settings.isVideoInputOff(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.getVideoInputDeviceLabelById(
      state,
      selectors.settings.getVideoInputDeviceId(state) || ''
    ),
    selectors.settings.isAudioInputOff(state),
    selectors.settings.getAudioInputDeviceId(state),
    selectors.settings.getAudioInputDeviceLabelById(
      state,
      selectors.settings.getAudioInputDeviceId(state) || ''
    ),
    selectors.settings.isAudioOutputOff(state),
    selectors.settings.getAudioOutputDeviceId(state),
    selectors.settings.getAudioOutputDeviceLabelById(
      state,
      selectors.settings.getAudioOutputDeviceId(state) || ''
    ),
  ])

  useEffect(() => {
    async function getCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: videoDeviceId },
        },
      })

      if (videoRef && videoRef.current) {
        videoRef.current.srcObject = stream
      }
    }

    getCamera()
  }, [videoDeviceId])

  return (
    <Container>
      {isVideoOff ? (
        <CameraOff>
          <Icon name="video-off" />
        </CameraOff>
      ) : (
        <video autoPlay muted playsInline ref={videoRef} />
      )}
      <Table>
        <Prop>Camera:</Prop>
        <Value off={isVideoOff}>
          {isVideoOff ? 'off' : videoDeviceLabel || videoDeviceId}
        </Value>
        <Prop>Microphone:</Prop>
        <Value off={isMicOff}>
          {isMicOff ? 'off' : micDeviceLabel || micDeviceId}
        </Value>
        <Prop>Speakers:</Prop>
        <Value off={isSpeakerOff}>
          {isSpeakerOff ? 'off' : speakerDeviceLabel || speakerDeviceId}
        </Value>
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

export const CameraOff = styled('div', {
  position: 'relative',
  width: '100%',
  borderRadius: '$small',
  background: '$gray1',
  marginBottom: '11.5px',
  aspectRatio: '1.5 / 1',
  color: '$gray4',
  fontSize: '$small',
  center: true,
  '& svg': {
    width: '28px',
    height: '28px',
  },
})

const Label = styled('label', {
  color: '$gray8',
})

export const Table = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'min-content 1fr',
  gridRowGap: '8px',
  gridColumnGap: '16px',
  fontSize: '12px',
  label: true,
  paddingTop: '12px',
})

export const Prop = styled('div', {
  fontWeight: '$medium',
  color: '$gray8',
})

export const Value = styled('div', {
  color: '$silver',
  textTransform: 'capitalize',
  textAlign: 'right',
  ellipsis: true,
  variants: {
    off: {
      true: {
        color: '$red',
      },
      false: {
        color: '$gray9',
      },
    },
  },
})
