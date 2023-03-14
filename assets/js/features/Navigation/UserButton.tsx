import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import Icon from 'components/Icon'
import { getIcon } from 'components/PresenceModeIcon'
import { useUserSocket } from 'features/UserSocket'
import { Users } from 'state/entities'
import {
  StatusCircle,
  StatusIcon,
  StyledStatusIcon,
} from 'features/Dock/StatusIcon'
import { StyledButton } from 'features/Dock/Button'

interface Props {
  id: string
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
    <Container>
      <StatusIcon status={status} isOnline={isOnline} noEmoji />
      <Name online={isOnline}>{user?.name}</Name>
    </Container>
  )
}

const Container = styled('div', {
  unitHeight: 6,
  vcenter: true,
  gap: '6px',
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
