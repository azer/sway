import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import Icon from 'components/Icon'
import { modeProps } from 'features/Status/PresenceMode'

interface Props {
  id: string
}

export default function UserButton(props: Props) {
  // const dispatch = useDispatch()
  const [user, presence] = useSelector((state) => [
    selectors.users.getById(state, props.id),
    selectors.status.getPresenceStatusByUserId(state, props.id),
  ])

  const [icon, caption] = modeProps(presence.mode)

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
