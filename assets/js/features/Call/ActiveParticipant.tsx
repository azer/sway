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

  const participant = window.fakeState
    ? // @ts-ignore
      window.fakeState.useParticipant(props.participantId)
    : useParticipant(props.participantId)
  const screensharing = participant && participant.screen

  const [user, isSpeakerOn, isSelf] = useSelector((state) => [
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
    <Border active>
      <Container data-participant-id={props.participantId}>
        {screensharing ? (
          <ScreenshareVideo sessionId={participant?.session_id} />
        ) : null}
        {!participant?.audio ? (
          <MuteIcon>
            <Icon name="mic-off" />
          </MuteIcon>
        ) : null}
        {screensharing ? (
          <ParticipantLabel
            id={props.participantId}
            label={isSelf ? 'Your screen' : `${user?.name}'s screen`}
          />
        ) : null}
        <Inner screensharing={!!screensharing}>
          {!screensharing ? (
            <ParticipantLabel
              id={props.participantId}
              username={user?.name}
            ></ParticipantLabel>
          ) : null}

          <Video id={props.participantId} />
          {audioTrack && !isSelf && (
            <audio
              autoPlay
              playsInline
              muted={props.muted || !isSpeakerOn}
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
  height: '100%',
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
        right: '0',
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

const Info = styled('div', {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'row',
  height: '24px',
  bottom: '12px',
  left: '16px',
  gap: '6px',
  [`& label`]: {
    textShadow: 'rgba(0,0,0,0.3) 1px 1px 1px',
  },
  variants: {
    screensharing: {
      true: {
        left: 'auto',
        bottom: '0',
        background: '$shellBg',
        borderRadius: '$small $small 0 0',
        padding: '0 8px',
        fontSize: '12px',
        '& img': {
          round: 'small 0 0 0',
        },
      },
    },
  },
})

const MuteIcon = styled('div', {
  position: 'absolute',
  bottom: '12px',
  right: '16px',
  width: '16px',
  height: '16px',
})
