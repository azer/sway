import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import Icon from 'components/Icon'
import { getIcon } from 'components/PresenceModeIcon'
import { useUserSocket } from 'features/UserSocket'
import { Users } from 'state/entities'

interface Props {
  id: string
}

export function UserButton(props: Props) {
  // const dispatch = useDispatch()
  const socket = useUserSocket()
  const [user, presenceIcon] = useSelector((state) => [
    selectors.users.getById(state, props.id),
    selectors.presence.getLocalPresenceIcon(state),
  ])

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.id)
    }
  }, [!user])

  return (
    <Container>
      <Status>
        <Icon name={presenceIcon} />
      </Status>
      <Name>{user?.name}</Name>
    </Container>
  )
}

const Container = styled('div', {
  unitHeight: 8,
  vcenter: true,
  gap: '6px',
})

const Status = styled('div', {
  width: '10px',
})

const Name = styled('div', {
  fontSize: '$small',
  fontWeight: '$medium',
  label: true,
})
