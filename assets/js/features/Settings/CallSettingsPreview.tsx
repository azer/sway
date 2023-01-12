import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import {
  useDaily,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'

interface Props {
  deviceId?: string
}

const log = logger('settings/preview')

export function CallSettingsPreview(props: Props) {
  const call = useDaily()
  const videoElement = useRef()
  const localParticipant = useLocalParticipant()
  const videoTrack = useVideoTrack(localParticipant?.session_id || '')

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

    if (!call.localVideo()) {
      log.info('Turn on local video')
      call.setLocalVideo(true)
      call.setInputDevicesAsync({
        videoDeviceId: videoDeviceId,
      })
    }

    return () => {
      log.info('Turn off local video')
      call.setLocalVideo(false)
      call.setInputDevicesAsync({
        videoSource: false,
      })
    }
  }, [call])

  return (
    <Container>
      {isVideoOff ? (
        <CameraOff>
          <Icon name="video-off" />
        </CameraOff>
      ) : (
        <video autoPlay muted playsInline ref={videoElement} />
      )}
      <Table>
        <Prop>Camera</Prop>
        <Value off={isVideoOff}>
          {isVideoOff ? 'off' : videoDeviceLabel || videoDeviceId}
        </Value>
        <Prop>Microphone</Prop>
        <Value off={isMicOff}>
          {isMicOff ? 'off' : micDeviceLabel || micDeviceId}
        </Value>
        <Prop>Speakers</Prop>
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
    aspectRatio: '1.75 / 1',
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
  aspectRatio: '1.75 / 1',
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
  gridRowGap: '4px',
  gridColumnGap: '16px',
  fontSize: '12px',
  label: true,
  padding: '0 8px',
})

export const Prop = styled('div', {
  fontWeight: '$medium',
  color: '$gray8',
  textAlign: 'left',
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
