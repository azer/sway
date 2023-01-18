import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { ActiveParticipant } from 'features/Call/ActiveParticipant'
import logger from 'lib/log'
import { styled } from 'themes'
import {
  getIcon,
  getLabel,
  PresenceModeIcon,
} from 'components/PresenceModeIcon'
import Icon from 'components/Icon'
import { AvatarView } from 'features/Avatar/AvatarView'
import { PresenceMode, Users } from 'state/entities'
import { useUserSocket } from 'features/UserSocket'

interface Props {
  userId: string
}

const log = logger('room/participant')

export function Participant(props: Props) {
  const socket = useUserSocket()
  const [user, participant, status] = useSelector((state) => [
    selectors.users.getById(state, props.userId),
    selectors.call.getParticipantStatusByUserId(state, props.userId),
    selectors.presence.getStatusByUserId(state, props.userId),
  ])

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.userId)
    }
  }, [!user])

  if (
    participant &&
    participant.dailyUserId &&
    (participant.cameraOn ||
      participant?.micOn ||
      status.status === PresenceMode.Social)
  ) {
    return <ActiveParticipant participantId={participant.dailyUserId} />
  }

  return (
    <Border>
      <InactiveParticipant
        data-user-id={props.userId}
        title={getLabel(status.status)}
      >
        <User mode={status.status}>
          <Mode mode={status.status}>
            <Icon name={getIcon(status.status, status.is_active)} />
          </Mode>
          <Name>{user?.name.split(' ')[0] || 'Unknown'}</Name>
        </User>
        <AvatarView
          name={user?.name || ''}
          photoUrl={user?.photoUrl}
          fill
          round="large"
        />
      </InactiveParticipant>
    </Border>
  )
}

export const Border = styled('div', {
  padding: '4px',
  border: '1px solid rgba(150, 190, 255, 0.2)',
  borderRadius: '18px',
  variants: {
    active: {
      true: {
        border: '0',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: '1.25 / 1',
        'object-fit': 'cover',
      },
    },
  },
})

const InactiveParticipant = styled('div', {
  position: 'relative',
  center: true,
  borderRadius: '$large',
  width: '150px',
  aspectRatio: '1',
  padding: '2px',
})

export const User = styled('footer', {
  maxWidth: '130px',
  height: '24px',
  background: '$participantUsernameBg',
  color: '$participantUsernameFg',
  position: 'absolute',
  bottom: '8px',
  borderRadius: '$small 0 0 $small',
  display: 'flex',
  flexDirection: 'row',
  round: 'small',
  fontSize: '$small',
  fontWeight: '$medium',
  overflow: 'hidden',
  ellipsis: true,
  [`& ${PresenceModeIcon}`]: {
    height: '24px',
  },
  variants: {
    mode: {
      focus: {
        color: '$participantFocusFg',
        background: '$participantFocusBg',
      },
      active: {
        color: '$participantActiveFg',
        background: '$participantActiveBg',
      },
      away: {
        color: '$participantAwayFg',
        background: '$participantAwayBg',
      },
      dnd: {
        color: '$participantDndFg',
        background: '$participantDndBg',
      },
    },
  },
})

export const Name = styled('div', {
  label: true,
  fontWeight: '$medium',
  padding: '0 8px 0 6px',
  vcenter: true,
})

const Mode = styled('div', {
  padding: '4px 6px',
  vcenter: true,
  label: true,
  height: '100%',
  '& svg': {
    width: '14px',
  },
  variants: {
    mode: {
      focus: {
        color: '$participantFocusFg',
        background: '$participantFocusBg',
      },
      active: {
        color: '$participantActiveFg',
        background: '$participantActiveBg',
      },
      away: {
        color: '$participantAwayFg',
        background: '$participantAwayBg',
      },
      dnd: {
        color: '$participantDndFg',
        background: '$participantDndBg',
      },
    },
  },
})
