import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { useUserSocket } from 'features/UserSocket'
import { Users } from 'state/entities'
import {
  StatusCircle,
  StatusIcon,
  StyledStatusIcon,
} from 'features/Dock/StatusIcon'
import { UserContextMenu } from 'components/UserContextMenu'

interface Props {
  id: string
  selected?: boolean
  onClick: () => void
}

export function UserButton(props: Props) {
  const socket = useUserSocket()
  const [user, status, isOnline] = useSelector((state) => [
    selectors.users.getById(state, props.id),
    selectors.statuses.getByUserId(state, props.id),
    selectors.presence.isUserOnline(state, props.id),
  ])

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.id)
    }
  }, [!user])

  return (
    <UserContextMenu user={user} status={status} tap={tap}>
      <Container onClick={props.onClick} selected={props.selected}>
        <StatusIcon status={status} isOnline={isOnline} noEmoji />
        <Name online={isOnline}>{user?.name}</Name>
      </Container>
    </UserContextMenu>
  )

  function tap() {}
}

const Container = styled('div', {
  height: '32px',
  vcenter: true,
  gap: '6px',
  position: 'relative',
  variants: {
    selected: {
      true: {
        [`&::before`]: {
          background: '$navigationFocusBg',
          content: ' ',
          position: 'absolute',
          top: '0',
          left: '-10px',
          width: 'calc(100% + 20px)',
          round: 'small',
          height: '100%',
        },
        fontWeight: '$medium',
        color: '$navigationFocusFg',
        letterSpacing: '-0.06px',
      },
    },
  },
  [`& ${StyledStatusIcon}`]: {
    alignItems: 'start',
  },
  [`& em-emoji`]: {
    fontSize: '12px',
    marginLeft: '-4px',
  },
  [`& ${StatusCircle}`]: {
    width: '8px',
  },
})

const Status = styled('div', {
  fontSize: '$small',
  color: 'rgba(255, 255, 255, 0.5)',
})

const Name = styled('div', {
  fontSize: '$small',
  fontWeight: '$medium',
  label: true,
  variants: {
    online: {
      true: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
})

const Right = styled('div', {})
