import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack, useParticipant } from '@daily-co/daily-react-hooks'
import Video from './Video'
import logger from 'lib/log'
import { useDispatch, useSelector } from 'state'
import { AvatarView } from 'features/Avatar/AvatarView'
import { Name, User } from 'features/Room/RoomParticipant'

interface Props {
  participantId: string
  muted?: boolean
}

const log = logger('call/active-participant')

export function ActiveParticipant(props: Props) {
  const audioTrack = useMediaTrack(props.participantId, 'audio')
  const audioElement = useRef<HTMLAudioElement>()

  const participant = useParticipant(props.participantId)
  const [user, isSpeakerOff] = useSelector((state) => [
    participant?.userData
      ? // @ts-ignore
        selectors.users.getById(state, participant.userData.id)
      : undefined,
    selectors.settings.isAudioOutputOff(state),
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
    <Container data-participant-id={props.participantId}>
      <User>
        <AvatarView
          photoUrl={user?.photoUrl}
          name={user?.name}
          fill
          round="none"
        />
        <Name>{user?.name}</Name>
      </User>
      <Video id={props.participantId} />
      {!props.muted && !isSpeakerOff && audioTrack && (
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
  position: 'relative',
  round: 'large',
  overflow: 'hidden',
  center: true,
  width: '100%',
  '& video': {
    aspectRatio: '1.35 / 1',
    'object-fit': 'cover',
  },
})

/*const User = styled('figcaption', {
  position: 'absolute',
  bottom: '8px',
  height: '24px',
  display: 'flex',
  flexDirection: 'row',
  gap: '4px',
  background: '$participantUsernameBg',
  color: '$participantUsernameFg',
  round: 'small',
  fontSize: '$small',
  overflow: 'hidden',
  fontWeight: '$medium',
  backdrop: { blur: 10, saturate: 190, contrast: 70, brightness: 120 },
  '& img': {
    borderRadius: '0',
  },
})

const Name = styled('div', {
  label: true,
  fontWeight: '$medium',
  padding: '4px 8px 4px 6px',
})
*/
