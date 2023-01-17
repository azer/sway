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
    (participant.cameraOn || participant?.micOn)
  ) {
    return <ActiveParticipant participantId={participant.dailyUserId} />
  }

  return (
    <InactiveParticipant
      data-user-id={props.userId}
      title={getLabel(status.status)}
    >
      <User mode={status.status}>
        <Mode mode={status.status}>
          <Icon name={getIcon(status.status, status.is_active)} />
        </Mode>
        <Name>{user?.name || 'Unknown'}</Name>
      </User>
      <AvatarView
        name={user?.name || ''}
        photoUrl={user?.photoUrl}
        fill
        round="large"
      />
    </InactiveParticipant>
  )
}

const InactiveParticipant = styled('div', {
  position: 'relative',
  center: true,
  borderRadius: '$large',
  width: '150px',
  aspectRatio: '1',
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
