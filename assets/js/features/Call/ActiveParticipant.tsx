import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack, useParticipant } from '@daily-co/daily-react-hooks'
import { Video } from './Video'
import { logger } from 'lib/log'
import { useDispatch, useSelector } from 'state'
import { AvatarView } from 'features/Avatar/AvatarView'
import { Border } from 'features/Room/RoomParticipant'
import { ScreenshareVideo } from 'features/Screenshare/Video'
import Icon from 'components/Icon'
import { ParticipantLabel } from 'components/ParticipantLabel'
import { Avatar, AvatarRoot } from 'components/Avatar'

interface Props {
  participantId: string
  muted?: boolean
}

const log = logger('call/active-participant')

export const ActiveParticipant = React.memo(
  UActiveParticipant,
  function (prev: Props, next: Props) {
    return (
      prev.muted === next.muted && prev.participantId === next.participantId
    )
  }
)

function UActiveParticipant(props: Props) {
  const audioTrack = useMediaTrack(props.participantId, 'audio')
  const audioElement = useRef<HTMLAudioElement>()

  const participant = useParticipant(props.participantId)
  const screensharing = participant && participant.screen

  const [user, isLocalSpeakerOn, isSelf] = useSelector((state) => [
    participant?.userData
      ? // @ts-ignore
        selectors.users.getById(state, participant.userData.id)
      : undefined,
    selectors.statuses.getLocalStatus(state).speaker_on,
    // @ts-ignore
    selectors.users.getSelf(state)?.id === participant?.userData?.id,
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
    <ActiveParticipantRoot data-participant-id={props.participantId}>
      <Container>
        {!participant?.audio && participant?.video ? (
          <MuteIcon>
            <Icon name="mic-off" />
          </MuteIcon>
        ) : null}
        {!participant?.video ? (
          <MuteIcon>
            <Icon name="video-off" />
          </MuteIcon>
        ) : null}

        <ParticipantLabel id={props.participantId} username={user?.name} />

        {participant?.video ? (
          <Video id={props.participantId} />
        ) : (
          <Avatar
            src={user?.photoUrl}
            fallback={user?.name || 'User ' + props.participantId}
          />
        )}
        {audioTrack && !isSelf && (
          <audio
            autoPlay
            playsInline
            muted={props.muted || !isLocalSpeakerOn}
            ref={audioElement as React.RefObject<HTMLAudioElement>}
          />
        )}
      </Container>
    </ActiveParticipantRoot>
  )
}

export const ActiveParticipantRoot = styled('div', {
  width: 'var(--tile-width)',
  height: 'var(--tile-height)',
  maxWidth: '100%',
  maxHeight: '100%',
  display: 'flex',
  aspectRatio: '1.25 / 1',
  'object-fit': 'cover',
  background: '$participantBg',
  round: 'xlarge',
  overflow: 'hidden',
  [`& ${AvatarRoot}`]: {
    marginTop: '-10px',
    fontSize: '18px',
    height: '50%',
    round: true,
  },
})

const Container = styled('div', {
  position: 'relative',
  overflow: 'hidden',
  center: true,
  width: '100%',
  height: '100%',
  maxWidth: '100%',
  maxHeight: '100%',
  aspectRatio: '1.25 / 1',
  'object-fit': 'cover',
})

const MuteIcon = styled('div', {
  position: 'absolute',
  bottom: '12px',
  right: '16px',
  width: '16px',
  height: '16px',
  color: 'rgba(255, 255, 255, 0.6)',
})
