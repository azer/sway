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
import { UserContextMenu } from 'components/UserContextMenu'

interface Props {
  userId: string
  tap: (userId: string) => void
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
    return (
      <ActiveParticipant
        userId={participant.swayUserId}
        participantId={participant.dailyUserId}
        tap={props.tap}
      />
    )
  }

  return (
    <UserContextMenu user={user} status={status} tap={props.tap}>
      <RoomParticipantRoot data-user-id={props.userId}>
        <ParticipantLabel id={props.userId} username={user?.name}>
          <StatusIcon status={status} noEmoji />
        </ParticipantLabel>
        <Avatar
          src={user?.photoUrl}
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
    fontSize: '18px',
    height: '50%',
    round: true,
  },
})
