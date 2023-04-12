import { styled } from 'themes'
import React, { useEffect, useMemo } from 'react'
import { useMediaTrack } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'

const log = logger('picture-in-picture/video')

interface Props {
  participantId: string
  playerRef: React.MutableRefObject<HTMLVideoElement | null>
}

export function PictureInPictureVideo(props: Props) {
  const track = useMediaTrack(props.participantId, 'video')

  useEffect(() => {
    const playerEl = props.playerRef.current

    if (!playerEl || !track?.persistentTrack) return

    log.info('Set track', track.persistentTrack)
    playerEl.srcObject = new MediaStream([track?.persistentTrack])
  }, [track?.persistentTrack?.id])

  const videoEl = useMemo(() => {
    log.info('Re-render element')
    return <Player autoPlay muted playsInline ref={props.playerRef} />
  }, [props.participantId])

  return videoEl
}

export const Player = styled('video', {
  aspectRatio: '1',
  width: '50px',
  height: '50px',
  visibility: 'hidden',
  'object-fit': 'cover',
  position: 'absolute',
  top: '0',
  left: '0',
})
