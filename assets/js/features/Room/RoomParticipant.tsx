import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { ActiveParticipant } from 'features/Call/ActiveParticipant'
import { logger } from 'lib/log'
import { styled } from 'themes'
import { Users } from 'state/entities'
import { useUserSocket } from 'features/UserSocket'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { StatusIcon } from 'features/Dock/StatusIcon'
import { ParticipantLabel } from 'components/ParticipantLabel'

interface Props {
  userId: string
}

const log = logger('room/participant')

export function Participant(props: Props) {
  const socket = useUserSocket()
  const [user, participant, status, isActive, presenceIcon] = useSelector(
    (state) => [
      selectors.users.getById(state, props.userId),
      selectors.call.getParticipantStatusByUserId(state, props.userId),
      selectors.statuses.getByUserId(state, props.userId),
      selectors.presence.isUserActive(state, props.userId),
      selectors.presence.getPresenceIconByUserId(state, props.userId),
    ]
  )

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.userId)
    }
  }, [!user])

  if (participant && participant.dailyUserId && isActive) {
    return <ActiveParticipant participantId={participant.dailyUserId} />
  }

  return (
    <Border>
      <InactiveParticipant data-user-id={props.userId}>
        <ParticipantLabel id={props.userId} username={user?.name}>
          <StatusIcon status={status} />
        </ParticipantLabel>
        <Avatar
          src={user?.photoUrl}
          fallback={user?.name || 'User ' + props.userId}
        />
      </InactiveParticipant>
    </Border>
  )
}

export const Border = styled('div', {
  padding: '4px',
  border: '1px solid $participantBorder',
  round: 'xlarge',
  variants: {
    active: {
      true: {
        border: '0',
        display: 'flex',
        width: 'var(--tile-width)',
        height: 'var(--tile-height)',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: '1.25 / 1',
        'object-fit': 'cover',
      },
    },
  },
})

export const InactiveParticipant = styled('div', {
  position: 'relative',
  center: true,
  borderRadius: '1.25rem',
  width: '150px',
  aspectRatio: '1',
  background: '$participantBg',
  [`& ${AvatarRoot}`]: {
    marginTop: '-10px',
    height: '60px',
    round: true,
  },
})
