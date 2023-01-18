import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack, useParticipant } from '@daily-co/daily-react-hooks'
import Video from './Video'
import logger from 'lib/log'
import { useDispatch, useSelector } from 'state'
import { AvatarView } from 'features/Avatar/AvatarView'
import { Border, Name, User } from 'features/Room/RoomParticipant'
import { ScreenshareVideo } from 'features/Screenshare/Video'

interface Props {
  participantId: string
  muted?: boolean
}

const log = logger('call/active-participant')

export function ActiveParticipant(props: Props) {
  const audioTrack = useMediaTrack(props.participantId, 'audio')
  const audioElement = useRef<HTMLAudioElement>()

  const participant = useParticipant(props.participantId)
  const [user, isSpeakerOn] = useSelector((state) => [
    participant?.userData
      ? // @ts-ignore
        selectors.users.getById(state, participant.userData.id)
      : undefined,
    selectors.dock.isAudioOutputOn(state),
  ])

  useEffect(() => {
    if (audioTrack?.state === 'playable') {
      if (audioElement?.current) {
        audioElement.current.srcObject =
          audioTrack && new MediaStream([audioTrack.persistentTrack]) // @ts-ignore
      }
    }
  }, [audioTrack])

  return (
    <Border active>
      <Container data-participant-id={props.participantId}>
        {participant && participant.screen ? (
          <ScreenshareVideo sessionId={participant?.session_id} />
        ) : null}

        <Inner screensharing={!!participant?.screen}>
          {!participant?.screen ? (
            <User>
              <AvatarView
                photoUrl={user?.photoUrl}
                name={user?.name}
                fill
                round="none"
              />
              <Name>{user?.name.split(' ')[0]}</Name>
            </User>
          ) : null}

          <Video id={props.participantId} />
          {!props.muted && isSpeakerOn && audioTrack && (
            <audio
              autoPlay
              playsInline
              ref={audioElement as React.RefObject<HTMLAudioElement>}
            />
          )}
        </Inner>
      </Container>
    </Border>
  )
}

const Container = styled('div', {
  position: 'relative',
  round: 'large',
  overflow: 'hidden',
  center: true,
  width: '100%',
  maxWidth: '100%',
  maxHeight: '100%',
  aspectRatio: '1.25 / 1',
  'object-fit': 'cover',
})

const Inner = styled('div', {
  width: '100%',
  height: '100%',
  center: true,
  overflow: 'hidden',
  variants: {
    screensharing: {
      true: {
        position: 'absolute',
        width: '15%',
        height: '15%',
        bottom: '16px',
        right: '16px',
        '& video': {
          round: 'large',
          background: 'rgba(0, 0, 0, 1)',
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          boxShadow: 'rgb(0 0 0 / 50%) 0px 0px 20px',
          'object-fit': 'cover',
          aspectRatio: '1',
        },
      },
    },
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
