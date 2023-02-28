import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { ActiveParticipant } from 'features/Call/ActiveParticipant'
import { logger } from 'lib/log'
import { styled } from 'themes'
import Icon from 'components/Icon'
import { AvatarView } from 'features/Avatar/AvatarView'
import { Users } from 'state/entities'
import { useUserSocket } from 'features/UserSocket'
import { findModeByStatus } from 'state/presence'

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
        <User>
          <PresenceModeIcon status={status.status}>
            <Icon name={presenceIcon} />
          </PresenceModeIcon>
          <Name>{user?.name.split(' ')[0] || 'Unknown'}</Name>
        </User>
        <AvatarView
          name={user?.name || ''}
          photoUrl={user?.photoUrl}
          fill
          round="medium"
        />
      </InactiveParticipant>
    </Border>
  )
}

export const Border = styled('div', {
  padding: '4px',
  border: '1px solid rgba(150, 190, 255, 0.1)',
  round: 'large',
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
  width: '150px',
  aspectRatio: '1',
})

export const User = styled('footer', {
  maxWidth: '130px',
  height: '24px',
  background: '$participantUsernameBg',
  borderBottom: '0',
  color: '$participantUsernameFg',
  position: 'absolute',
  bottom: '0',
  borderRadius: '$small $small 0 0',
  display: 'flex',
  flexDirection: 'row',
  fontSize: '$small',
  fontWeight: '$medium',
  overflow: 'hidden',
  ellipsis: true,
  gap: '8px',
  padding: '4px 14px 2px 14px',
})

export const Name = styled('label', {
  display: 'block',
  label: true,
  fontWeight: '$medium',
  vcenter: true,
})

const PresenceModeIcon = styled('div', {
  vcenter: true,
  label: true,
  height: '100%',
  '& svg': {
    width: '14px',
  },
  variants: {
    status: {
      focus: {
        color: '$participantFocusBg',
      },
      online: {
        color: '$participantSocialBg',
      },
      zen: {
        color: '$participantZenBg',
      },
    },
  },
})
