import { styled } from 'themes'
import React, { useEffect, useMemo, useRef } from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import { useLocalParticipant, useVideoTrack } from '@daily-co/daily-react-hooks'
// import { useSelector, useDispatch } from 'state'

const log = logger('onboarding/video')

interface Props {}

export const XHaircheckVideo = React.memo(HaircheckVideo)

export function HaircheckVideo(props: Props) {
  const localParticipant = useLocalParticipant()
  const videoTrack = useVideoTrack(localParticipant?.session_id || '')
  const el = useRef<HTMLVideoElement | null>()
  const trackSwitchDelay = useRef<NodeJS.Timer | null>(null)

  useEffect(() => {
    if (!videoTrack.persistentTrack) return
    if (!el?.current) return

    /*if (trackSwitchDelay.current !== null) {
      log.info('Clear previous delay')
      clearTimeout(trackSwitchDelay.current)
      trackSwitchDelay.current = null
    } else {
      log.info(
        'set track for first time',
        videoTrack,
        videoTrack.persistentTrack?.readyState
      )
      el.current.srcObject =
        videoTrack.persistentTrack &&
        new MediaStream([videoTrack?.persistentTrack])

      trackSwitchDelay.current = setTimeout(() => {}, 1000)
      return
    }*/

    //trackSwitchDelay.current = setTimeout(() => {
    log.info('Set track', videoTrack)
    el.current.srcObject =
      videoTrack.persistentTrack &&
      new MediaStream([videoTrack?.persistentTrack])

    //trackSwitchDelay.current = null
    //}, 1000)
  }, [!el.current, videoTrack.persistentTrack?.id])

  const videoEl = useMemo(() => {
    log.info('Re-render', props)
    return <Video mirror autoPlay muted playsInline ref={el} />
  }, [])

  return videoEl
}

export const Video = styled('video', {
  width: '100%',
  height: '100%',
  'object-fit': 'cover',
  variants: {
    mirror: {
      true: {
        transform: 'rotateY(180deg)',
      },
    },
  },
})
