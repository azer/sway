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
  const [user, presence] = useSelector((state) => [
    selectors.users.getById(state, props.id),
    selectors.presence.getStatusByUserId(state, props.id),
  ])

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.id)
    }
  }, [!user])

  const icon = getIcon(presence?.status, presence.mic_on)

  return (
    <Container>
      <Status>
        <Icon name={icon} />
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
