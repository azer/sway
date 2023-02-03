import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import Icon from 'components/Icon'
import { getIcon } from 'components/PresenceModeIcon'

interface Props {
  id: string
}

export function UserButton(props: Props) {
  // const dispatch = useDispatch()
  const [user, presence] = useSelector((state) => [
    selectors.users.getById(state, props.id),
    selectors.presence.getStatusByUserId(state, props.id),
  ])

  const icon = getIcon(presence?.status, presence.is_active)

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
