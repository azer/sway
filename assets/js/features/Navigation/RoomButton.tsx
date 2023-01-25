import { styled } from 'themes'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Avatar } from 'features/Avatar'

import { AvatarStack } from 'features/Avatar/AvatarView'
import { RoomStatus } from 'features/Room/selectors'
// import { useSelector, useDispatch } from 'state'

interface Props {
  id: string
  selected?: boolean
}

export function RoomButton(props: Props) {
  const navigate = useNavigate()

  const [room, usersInRoom, roomStatus] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.id),
    selectors.rooms.getUsersInRoom(state, props.id),
    selectors.rooms.getRoomStatus(state, props.id),
  ])

  return (
    <Container
      selected={props.selected}
      hasUsers={!props.selected && usersInRoom.length > 0}
      onClick={handleClick}
    >
      <PresenceIcon mode={roomStatus} />
      <Name>{room?.name || ''}</Name>
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
  gap: '8px',
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
        gridTemplateColumns: '8px 65% auto',
      },
    },
  },
})

const Name = styled('div', {
  label: true,
  ellipsis: true,
  letterSpacing: 'inherit',
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

const PresenceIcon = styled('div', {
  width: '8px',
  height: '8px',
  round: true,
  variants: {
    mode: {
      [RoomStatus.Offline]: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      [RoomStatus.Focus]: {
        backgroundColor: '$yellow',
      },
      [RoomStatus.Active]: {
        backgroundColor: '$green',
      },
    },
  },
})
