import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'
import { useSelector } from 'state'

interface Props {
  id: string
}

const log = logger('video')

export const Video = React.memo(UVideo, function (prev: Props, next: Props) {
  return prev.id === next.id
})

function UVideo(props: Props) {
  // const dispatch = useDispatch()
  const [isActive, isSpeakerOff] = useSelector((state) => [
    selectors.presence.getSelfStatus(state).is_active,
    selectors.settings.isAudioOutputOff(state),
  ])
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

    log.info('track')
    /*  The track is ready to be played. We can show video of the participant in the UI. */
    video.srcObject = new MediaStream([track?.persistentTrack])
  }, [track, track?.persistentTrack])

  log.info('Rendering video player', props.id, isActive, isSpeakerOff)

  return (
    <Player autoPlay muted={!isActive || !isSpeakerOff} playsInline ref={el} />
  )
}

const Player = styled('video', {
  width: '100%',
  height: '100%',
  'object-fit': 'cover',
  background: 'rgba(0, 0, 0, 0.2)',
})
