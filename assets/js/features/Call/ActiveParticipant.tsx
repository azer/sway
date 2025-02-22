import { styled } from 'themes'
import React, { useEffect, useMemo, useRef } from 'react'
import selectors from 'selectors'
import { useMediaTrack, useParticipant } from '@daily-co/daily-react-hooks'
import { CallVideoRoot, Video } from './Video'
import { logger } from 'lib/log'
import { useSelector } from 'state'
import { ScreenshareVideo } from 'features/Screenshare/Video'
import Icon from 'components/Icon'
import {
  ParticipantLabel,
  ParticipantLabelRoot,
} from 'components/ParticipantLabel'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { participantLabelBg } from 'themes/colors'
import { firstName } from 'lib/string'
import { UserContextMenu } from 'components/UserContextMenu'
import { stringToRGB } from 'lib/colors'

interface Props {
  participantId: string
  userId: string
  muted?: boolean
  showScreen?: boolean
  tap: (userId: string) => void
  small?: boolean
}

const log = logger('call/active-participant')

export const ActiveParticipant = React.memo(
  UActiveParticipant,
  function (prev: Props, next: Props) {
    return (
      prev.muted === next.muted &&
      prev.participantId === next.participantId &&
      prev.showScreen === next.showScreen &&
      prev.small === next.small
    )
  }
)

function UActiveParticipant(props: Props) {
  const audioTrack = useMediaTrack(props.participantId, 'audio')
  const audioElement = useRef<HTMLAudioElement>()

  const dailyParticipant = useParticipant(props.participantId)

  const [
    user,
    status,
    isVideoOn,
    isMicOn,
    isScreenOn,
    isLocalSpeakerOn,
    isSelf,
    shouldHideVideo,
  ] = useSelector((state) => {
    const swayParticipant = selectors.call.getParticipantStatusByUserId(
      state,
      props.userId
    )

    return [
      selectors.users.getById(state, props.userId),
      selectors.status.getStatusByUserId(state, props.userId),
      swayParticipant?.cameraOn,
      swayParticipant?.micOn,
      swayParticipant?.screenOn,
      selectors.status.getLocalStatus(state).speaker_on,
      selectors.users.getSelf(state)?.id === dailyParticipant?.userData?.id,
      selectors.call.shouldHideVideo(state),
    ]
  })

  useEffect(() => {
    if (audioTrack?.state === 'playable') {
      if (audioElement?.current) {
        audioElement.current.srcObject =
          audioTrack && new MediaStream([audioTrack.persistentTrack]) // @ts-ignore
      }
    }
  }, [audioTrack])

  const color = useMemo(() => {
    return stringToRGB(user?.name || props.userId, participantLabelBg)
  }, [user?.name])

  const showScreen = isScreenOn && props.showScreen

  return (
    <UserContextMenu
      userId={props.userId}
      user={user}
      status={status}
      tap={props.tap}
    >
      <ActiveParticipantRoot
        data-participant-id={props.participantId}
        screenOn={showScreen}
        small={props.small}
        css={{ '--participant-bg': color }}
      >
        {!isMicOn && isVideoOn ? (
          <MuteIcon>
            <Icon name="mic-off" />
          </MuteIcon>
        ) : null}
        {!isVideoOn ? (
          <MuteIcon>
            <Icon name="video-off" />
          </MuteIcon>
        ) : null}

        <ParticipantLabel
          id={props.participantId}
          label={
            showScreen
              ? `${firstName(user?.name || 'User')}'s Screen`
              : firstName(user?.name || 'User')
          }
        />

        {showScreen && dailyParticipant?.session_id ? (
          <ScreenshareVideo sessionId={dailyParticipant?.session_id} />
        ) : null}

        {isVideoOn ? (
          <Video
            participantId={props.participantId}
            userId={props.userId}
            mirror={isSelf}
          />
        ) : (
          <Avatar
            src={user?.profile_photo_url}
            fallback={user?.name || 'User'}
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
      </ActiveParticipantRoot>
    </UserContextMenu>
  )
}

export const ActiveParticipantRoot = styled('div', {
  position: 'relative',
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
  center: true,
  [`& ${AvatarRoot}`]: {
    marginTop: '-10px',
    fontSize: 'var(--avatar-font-size)',
    height: '50%',
    round: true,
  },
  [`& ${ParticipantLabelRoot}`]: {
    background: 'var(--participant-bg)',
  },
  /*'& ${CallVideoRoot}': {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
  },*/
  variants: {
    small: {
      true: {
        round: 'large',
        [`& ${ParticipantLabelRoot}`]: {
          display: 'none',
        },
        [`& ${AvatarRoot}`]: {
          margin: '0',
          round: 'large',
          height: '100%',
        },
      },
    },
    screenOn: {
      true: {
        width: '100%',
        [`& ${CallVideoRoot}`]: {
          position: 'absolute',
          width: 'auto',
          height: 'var(--screenshare-avatar-size)',
          right: '20px',
          bottom: '20px',
          left: 'auto',
          top: 'auto',
          borderRadius: '100%',
          aspectRatio: '1',
          boxShadow: '0px 0px 5px rgb(0 0 0 / 10%)',
        },
        [`& ${AvatarRoot}`]: {
          display: 'none',
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
  color: 'rgba(255, 255, 255, 0.6)',
  zIndex: '$aboveContent',
})
