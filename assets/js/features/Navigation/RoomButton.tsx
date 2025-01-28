import { styled } from 'themes'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import selectors from 'selectors'
import { RoomStatusIcon } from 'components/RoomStatusIcon'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { useRooms } from 'features/Room/use-rooms'
import { openRoomSidebar, setSidebarOpen } from 'features/Sidebar/slice'
import { useSelector, useDispatch } from 'state'
import { StyledUserButton, Name } from './UserButton'

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
    focusedRoomId,
    roomIdOnSidebar,
    isLocalUserActive,
  ] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.id),
    selectors.rooms
      .getOtherUsersInRoom(state, props.id)
      .map((id) => selectors.users.getById(state, id)),
    selectors.rooms.getRoomStatus(state, props.id),
    selectors.chat.hasUnreadMessage(state, props.id),
    selectors.rooms.getFocusedRoomId(state),
    selectors.sidebar.getRoomIdOnSidebar(state),
    selectors.status.isLocalUserActive(state),
  ])

  const selected = focusedRoomId === props.id

  return (
    <Container
      selected={selected || roomIdOnSidebar === props.id}
      onSidebar={!selected && roomIdOnSidebar === props.id}
      hasUsers={!selected && usersInRoom.length > 0}
      onClick={handleClick}
      unread={hasUnreadMessages}
    >
      <RoomStatusIcon mode={roomStatus} />
      <Name>{room?.name || ''}</Name>
      {!selected && usersInRoom.length > 0 ? (
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
    if (focusedRoomId === props.id) {
      return
    }

    if (isLocalUserActive && roomIdOnSidebar !== props.id) {
      dispatch(openRoomSidebar(props.id))
      return
    }

    rooms.enterById(props.id)
    dispatch(setSidebarOpen(false))
  }
}

const Container = styled(StyledUserButton, {
  round: 'small',
  [`& ${RoomStatusIcon}`]: {
    marginTop: '2px',
  },
  variants: {
    hasUsers: {
      true: {
        display: 'grid',
        gridTemplateColumns: '8px 65% auto',
      },
    },
  },
})

export const AvatarStack = styled('div', {
  display: 'flex',
  flexDirection: 'row-reverse',
  justifyContent: 'end',
  '& *:not(:last-child)': {
    marginLeft: '-8px',
  },
  [`& ${AvatarRoot}`]: {
    aspectRatio: '1',
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
