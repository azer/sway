import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { ActiveParticipant } from 'features/Call/ActiveParticipant'
import { logger } from 'lib/log'
import { styled } from 'themes'
import { Users } from 'state/entities'
import { useUserSocket } from 'features/UserSocket'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { StatusIcon, StyledStatusIcon } from 'features/Dock/StatusIcon'
import {
  ParticipantLabel,
  ParticipantLabelRoot,
} from 'components/ParticipantLabel'
import { UserContextMenu } from 'components/UserContextMenu'

interface Props {
  userId: string
  tap: (userId: string) => void
  small?: boolean
}

const log = logger('room/participant')

export function RoomParticipant(props: Props) {
  const socket = useUserSocket()
  const [user, participant, status, isActive] = useSelector((state) => [
    selectors.users.getById(state, props.userId),
    selectors.call.getParticipantStatusByUserId(state, props.userId),
    selectors.statuses.getByUserId(state, props.userId),
    selectors.presence.isUserActive(state, props.userId),
  ])

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.userId)
    }
  }, [!user])

  if (participant && participant.dailyUserId && isActive) {
    return (
      <ActiveParticipant
        userId={participant.swayUserId}
        participantId={participant.dailyUserId}
        tap={props.tap}
        small={props.small}
      />
    )
  }

  return (
    <UserContextMenu user={user} status={status} tap={props.tap}>
      <RoomParticipantRoot data-user-id={props.userId} small={props.small}>
        {props.small ? <StatusIcon status={status} noEmoji /> : null}
        <ParticipantLabel id={props.userId} username={user?.name}>
          {!props.small ? <StatusIcon status={status} noEmoji /> : null}
        </ParticipantLabel>
        <Avatar
          src={user?.profile_photo_url}
          fallback={user?.name || 'User ' + props.userId}
        />
      </RoomParticipantRoot>
    </UserContextMenu>
  )
}

export const RoomParticipantRoot = styled('div', {
  width: 'var(--tile-width)',
  height: 'var(--tile-height)',
  maxWidth: '100%',
  maxHeight: '100%',
  position: 'relative',
  center: true,
  borderRadius: '1.25rem',
  aspectRatio: '1',
  round: 'xlarge',
  background: '$participantBg',
  [`& ${AvatarRoot}`]: {
    marginTop: '-10px',
    fontSize: 'var(--avatar-font-size)',
    height: '50%',
    round: true,
  },
  variants: {
    small: {
      true: {
        round: 'large',
        [`& ${ParticipantLabelRoot}`]: {
          background: 'transparent',
          bottom: '2px',
          zIndex: '$content',
          display: 'none',
        },
        [`& ${StyledStatusIcon}`]: {
          position: 'absolute',
          bottom: '0',
          right: '0',
          zIndex: '$content',
          border: '1.5px solid $shellBg',
          round: true,
        },
        [`${AvatarRoot}`]: {
          margin: '0',
          height: '100%',
          aspectRatio: '1',
          round: 'large',
          zIndex: '0',
        },
      },
    },
  },
})
