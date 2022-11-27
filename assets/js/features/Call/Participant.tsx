import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack, useParticipant } from '@daily-co/daily-react-hooks'
import Video from './Video'
import logger from 'lib/log'
import { useSelector } from 'state'
import Avatar from 'components/Avatar'

interface Props {
  id: string
  muted?: boolean
}

const log = logger('call/participant')

export default function Participant(props: Props) {
  // const dispatch = useDispatch()

  const audioTrack = useMediaTrack(props.id, 'audio')
  const audioElement = useRef<HTMLAudioElement>()

  const participant = useParticipant(props.id)
  const [user] = useSelector((state) => [
    participant?.userData
      ? // @ts-ignore
        selectors.users.getById(state, participant.userData.id)
      : undefined,
  ])

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
      <User>
        <Avatar
          photoUrl={user?.photoUrl}
          name={user?.name}
          round="circle"
          fill
        />
        <Name>{user?.name}</Name>
      </User>
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

const Container = styled('figure', {
  round: 'large',
  overflow: 'hidden',
  center: true,
  '& video': {
    height: '100%',
    'object-fit': 'cover',
  },
  position: 'relative',
})

const User = styled('figcaption', {
  position: 'absolute',
  bottom: '8px',
  marginLeft: 'auto',
  height: '24px',
  vcenter: true,
  gap: '4px',
  background: '$participantUsernameBg',
  color: '$participantUsernameFg',
  padding: '4px 6px',
  round: 'small',
  fontSize: '$small',
  fontWeight: '$medium',
})

const Name = styled('label', {})
