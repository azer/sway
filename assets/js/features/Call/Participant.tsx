import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack } from '@daily-co/daily-react-hooks'
import Video from './Video'
// import { useSelector, useDispatch } from 'state'

interface Props {
  id: string
  muted?: boolean
}

export default function Participant(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const audioTrack = useMediaTrack(props.id, 'audio')
  const audioElement = useRef<HTMLAudioElement>()

  //  return <Container>Participant #{props.id}</Container>

  useEffect(() => {
    if (audioTrack?.state === 'playable') {
      if (audioElement?.current) {
        audioElement.current.srcObject =
          audioTrack && new MediaStream([audioTrack.persistentTrack]) // @ts-ignore
      }
    }
  }, [audioTrack])

  return (
    <Container data-participant-id={props.id}>
      <Video id={props.id} />
      {!props.muted && audioTrack && (
        <audio
          autoPlay
          playsInline
          ref={audioElement as React.RefObject<HTMLAudioElement>}
        />
      )}
    </Container>
  )
}

const Container = styled('div', {
  round: 'large',
  overflow: 'hidden',
  center: true,
  '& video': {
    height: '100%',
    'object-fit': 'cover',
  },
})
