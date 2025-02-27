import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { useUserSocket } from 'features/UserSocket'
import { Room, Row, Users } from 'state/entities'
import {
  StatusCircle,
  StatusIcon,
  StyledStatusIcon,
} from 'features/Dock/StatusIcon'
import { UserContextMenu } from 'components/UserContextMenu'
//import { AvatarStack } from './RoomButton'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { openUserSidebar, setSidebarOpen } from 'features/Sidebar/slice'
import { useRooms } from 'features/Room/use-rooms'
import { useNavigate } from 'react-router-dom'

interface Props {
  id: string
  tap: (id: string) => void
}

export function UserButton(props: Props) {
  const socket = useUserSocket()
  const dispatch = useDispatch()
  const rooms = useRooms()
  const navigate = useNavigate()

  const [
    user,
    status,
    isOnline,
    isPresentInPrivateRoom,
    userIdOnSidebar,
    privateRoomId,
    workspace,
    localUserId,
    focused,
    isLocalUserActive,
    isActive,
  ] = useSelector((state) => {
    const privateRoomId = selectors.rooms.get1v1RoomIdByUserId(state, props.id)

    return [
      selectors.users.getById(state, props.id),
      selectors.status.getStatusByUserId(state, props.id),
      selectors.presence.isUserOnline(state, props.id),
      selectors.navigation.isUserIn1v1Room(state, props.id),
      selectors.sidebar.getFocusedUserId(state),
      selectors.rooms.get1v1RoomIdByUserId(state, props.id),
      selectors.workspaces.getSelfWorkspace(state),
      selectors.session.getUserId(state),
      selectors.rooms.getFocusedRoomId(state),
      selectors.status.isLocalUserActive(state),
      selectors.status.isUserActive(state, props.id),
    ]
  })

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.id)
    }
  }, [!user])

  const selected = focused === privateRoomId

  return (
    <UserContextMenu
      userId={props.id}
      user={user}
      status={status}
      tap={props.tap}
    >
      <StyledUserButton
        onClick={handleClick}
        selected={selected || userIdOnSidebar === props.id}
        onSidebar={!selected && userIdOnSidebar === props.id}
      >
        <StatusIcon
          status={status}
          isActive={isActive}
          isOnline={isOnline}
          noEmoji
        />
        <Name online={isOnline}>{user?.name}</Name>
        {!selected && isPresentInPrivateRoom ? (
          <AvatarStack>
            <Avatar src={user?.profile_photo_url} fallback={user?.name || ''} />
          </AvatarStack>
        ) : null}
      </StyledUserButton>
    </UserContextMenu>
  )

  function handleClick(event: MouseEvent) {
    event.preventDefault()

    if (focused === privateRoomId) {
      return
    }

    if (isLocalUserActive && userIdOnSidebar !== props.id) {
      dispatch(openUserSidebar(props.id))
      return
    } else if (userIdOnSidebar === props.id) {
      dispatch(setSidebarOpen(false))
    }

    dispatch(setSidebarOpen(false))

    if (privateRoomId) {
      rooms.enterById(privateRoomId)
      return
    }

    if (!workspace || !localUserId) return

    rooms
      .createPrivateRoom(workspace.id, [props.id, localUserId])
      .then((resp) => {
        const created = resp.result as Row<Room>
        navigate(`/${workspace.slug}/room/${created.id}/${created.data.slug}`)
      })
  }
}

export const StyledUserButton = styled('div', {
  height: '32px',
  vcenter: true,
  gap: '6px',
  position: 'relative',
  color: '$navigationFg',
  variants: {
    onSidebar: {
      true: {
        [`&::before`]: {
          background: 'transparent !important',
          borderLeft: '3px solid rgba(255, 255, 255, 0.03)',
        },
      },
    },
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
    unread: {
      true: {
        fontWeight: '$semibold',
        color: '$navigationUnreadFg',
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

export const Name = styled('div', {
  fontSize: '$small',
  fontWeight: '$medium',
  label: true,
  ellipsis: true,
  letterSpacing: 'inherit',
  variants: {
    online: {
      true: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
})

const AvatarStack = styled('div', {
  position: 'absolute',
  right: '0',
  [`& ${AvatarRoot}`]: {
    border: '1.5px solid $shellBg',
    round: true,
    fontSize: '8px',
  },
})
