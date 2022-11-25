import { styled } from 'themes'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { AvatarStack } from 'components/Avatar'
import Avatar from 'features/Avatar'
// import { useSelector, useDispatch } from 'state'

interface Props {
  id: string
  selected?: boolean
}

export default function RoomButton(props: Props) {
  const navigate = useNavigate()

  const [room, usersInRoom] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.id),
    selectors.rooms.getUsersInRoom(state, props.id),
  ])

  return (
    <Container
      selected={props.selected}
      hasUsers={!props.selected && usersInRoom.length > 0}
      onClick={handleClick}
    >
      <Name>
        <Hash>#</Hash> {room?.name || ''}
      </Name>
      {!props.selected && usersInRoom.length > 0 ? (
        <Users>
          <AvatarStack>
            {usersInRoom.slice(0, 4).map((id) => (
              <Avatar key={id} id={id} small />
            ))}
          </AvatarStack>
        </Users>
      ) : null}
    </Container>
  )

  function handleClick() {
    if (room) navigate(`/rooms/${room.slug}`)
  }
}

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontSize: '$small',
  unitHeight: 8,
  space: { inner: [2, 3], outer: [0, -3] },
  color: '$navigationFg',
  round: 'small',
  variants: {
    selected: {
      true: {
        background: '$navigationFocusBg',
        fontWeight: '$medium',
        color: '$navigationFocusFg',
        letterSpacing: '-0.06px',
      },
    },
    hasUsers: {
      true: {
        display: 'grid',
        gridTemplateColumns: '65% auto',
      },
    },
  },
})

const Name = styled('div', {
  label: true,
  ellipsis: true,
  letterSpacing: 'inherit',
})

const Hash = styled('label', {
  space: { outer: [0, 2, 0, 0] },
})

const Users = styled('div', {
  height: '12px',
  position: 'relative',
  [`& ${AvatarStack}`]: {
    position: 'absolute',
    width: '100%',
    top: '-4px',
    height: '12px',
  },
})
