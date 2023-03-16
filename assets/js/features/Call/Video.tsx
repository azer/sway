import { styled } from 'themes'
import React, { useEffect, useMemo, useRef } from 'react'
import { useMediaTrack } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'

interface Props {
  id: string
}

const log = logger('call/video')

export const Video = React.memo(UVideo, function (prev: Props, next: Props) {
  return prev.id === next.id
})

function UVideo(props: Props) {
  const track = useMediaTrack(props.id, 'video')
  const el = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = el.current

    // @ts-ignore
    if (window.fakeState) {
      // @ts-ignore
      video.style.background = `center center url(${
        window.fakeState.participantStatus[props.id].cover
      })`
      // @ts-ignore
      video.style['background-size'] = 'cover'
      return
    }

    if (!video || !track?.persistentTrack) return

    log.info('Set track', track.persistentTrack)
    /*  The track is ready to be played. We can show video of the participant in the UI. */
    video.srcObject = new MediaStream([track?.persistentTrack])
  }, [track?.persistentTrack?.id])

  log.info('Rendering video element', props.id, track)

  const videoEl = useMemo(() => {
    log.info('Re-render element')
    return <CallVideoRoot autoPlay muted playsInline ref={el} />
  }, [props.id])

  return videoEl
}

export const CallVideoRoot = styled('video', {
  width: '100%',
  height: '100%',
  'object-fit': 'cover',
})
