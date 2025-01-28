import { styled } from 'themes'
import React, { useEffect, useMemo, useRef } from 'react'
import { useMediaTrack, useVideoTrack } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'

const log = logger('picture-in-picture/video')

interface Props {
  participantId: string
  mirror?: boolean
}

export function PictureInPictureVideo(props: Props) {
  const track = useVideoTrack(props.participantId, 'video')
  const el = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const playerEl = el.current

    if (!playerEl || !track?.persistentTrack) return

    log.info('Set track', track.persistentTrack)
    playerEl.srcObject = new MediaStream([track?.persistentTrack])
  }, [track?.persistentTrack?.id])

  const videoEl = useMemo(() => {
    log.info('Re-render element')
    return <Player autoPlay muted playsInline ref={el} />
  }, [track.persistentTrack])

  return videoEl
}

export const Player = styled('video', {
  aspectRatio: '1',
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
