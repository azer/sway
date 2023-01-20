import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import { useMediaTrack } from '@daily-co/daily-react-hooks'
// import { useSelector, useDispatch } from 'state'

interface Props {
  sessionId: string
}

export function ScreenshareVideo(props: Props) {
  const videoTrack = useMediaTrack(props.sessionId, 'screenVideo')
  const videoElement = useRef(null)

  useEffect(() => {
    const video = videoElement.current
    if (!video || !videoTrack?.persistentTrack) return
    /*  The track is ready to be played. We can show video of the participant in the UI. */
    // @ts-ignore
    video.srcObject = new MediaStream([videoTrack?.persistentTrack])
  }, [videoTrack?.persistentTrack])

  return <Video autoPlay muted playsInline ref={videoElement}></Video>
}

const Video = styled('video', {
  width: '100%',
  height: '100%',
  'object-fit': 'contain',
  background: `rgba(255, 255, 255, 0.03)`,
})
