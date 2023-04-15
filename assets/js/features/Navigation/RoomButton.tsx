import { styled } from 'themes'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import selectors from 'selectors'
import { RoomStatusIcon } from 'components/RoomStatusIcon'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { useRooms } from 'features/Room/use-rooms'
import { openRoomSidebar } from 'features/Sidebar/slice'
import { useSelector, useDispatch } from 'state'

interface Props {
  id: string
  selected?: boolean
}

export function RoomButton(props: Props) {
  const navigate = useNavigate()
  const rooms = useRooms()
  const dispatch = useDispatch()

  const [
    room,
    usersInRoom,
    roomStatus,
    hasUnreadMessages,
    selected,
    roomIdOnSidebar,
  ] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.id),
    selectors.rooms
      .getOtherUsersInRoom(state, props.id)
      .map((id) => selectors.users.getById(state, id)),
    selectors.rooms.getRoomStatus(state, props.id),
    selectors.chat.hasUnreadMessage(state, props.id),
    selectors.rooms.getFocusedRoomId(state) === props.id,
    selectors.sidebar.getRoomIdOnSidebar(state),
  ])

  return (
    <Container
      selected={selected}
      hasUsers={!props.selected && usersInRoom.length > 0}
      onClick={handleClick}
      unread={hasUnreadMessages}
    >
      <RoomStatusIcon mode={roomStatus} />
      <Name>{room?.name || ''}</Name>
      {!props.selected && usersInRoom.length > 0 ? (
        <Users>
          <AvatarStack>
            {usersInRoom.slice(0, 4).map((user) => (
              <Avatar
                src={user?.profile_photo_url}
                fallback={user?.name || ''}
              />
            ))}
          </AvatarStack>
        </Users>
      ) : null}
    </Container>
  )

  function handleClick() {
    if (roomIdOnSidebar !== props.id) {
      dispatch(openRoomSidebar(props.id))
      return
    }

    rooms.enterById(props.id)
  }
}

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontSize: '$small',
  gap: '6px',
  unitHeight: 8,
  space: { inner: [2, 3], outer: [0, -3] },
  color: '$navigationFg',
  round: 'small',
  [`& ${RoomStatusIcon}`]: {
    marginTop: '2px',
  },
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
    unread: {
      true: {
        fontWeight: '$semibold',
        color: '$navigationUnreadFg',
      },
    },
  },
})

const Name = styled('div', {
  label: true,
  ellipsis: true,
  letterSpacing: 'inherit',
})

export const AvatarStack = styled('div', {
  display: 'flex',
  flexDirection: 'row-reverse',
  justifyContent: 'end',
  '& *:not(:last-child)': {
    marginLeft: '-8px',
  },
  [`& ${AvatarRoot}`]: {
    border: '1.5px solid $shellBg',
    round: true,
    fontSize: '8px',
  },
})

export const Users = styled('div', {
  height: '12px',
  position: 'relative',
  [`& ${AvatarStack}`]: {
    position: 'absolute',
    width: '100%',
    top: '-4px',
    height: '12px',
  },
})
