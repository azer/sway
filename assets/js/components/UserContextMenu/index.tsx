import React from 'react'
import { entities } from 'state'
import { ContextMenu } from 'components/ContextMenu'
import { UserHeader } from 'components/UserHeader'
import { useSelector, useDispatch } from 'state'
import { setStatusHook } from 'features/Tap/slice'
import { StatusModeKey } from 'state/status'
import selectors from 'selectors'
import { goto1v1 } from 'features/Room/slice'
import { useRooms } from 'features/Room/use-rooms'

interface Props {
  userId: string
  children: React.ReactNode
  user?: entities.User
  status?: entities.Status
  tap: (userId: string) => void
}

export function UserContextMenu(props: Props) {
  const dispatch = useDispatch()
  const rooms = useRooms()

  const [existingHook, isOnline, privateRoomId, privateRoomSlug] = useSelector(
    (state) => [
      selectors.taps.getStatusHookByUserId(state, props.userId),
      selectors.presence.isUserOnline(state, props.userId),
      selectors.rooms.get1v1RoomIdByUserId(state, props.userId),
      selectors.rooms.get1v1RoomByUserId(state, props.userId)?.slug,
    ]
  )

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{props.children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <UserHeader user={props.user} status={props.status} online={isOnline} />
        <ContextMenu.Separator />
        <ContextMenu.Item
          emoji="wave"
          label="Wave"
          onClick={() => props.user && props.tap(props.user.id)}
        />
        <ContextMenu.Item
          icon={existingHook ? 'checkmark' : 'bell'}
          label="Notify when available"
          onClick={createStatusHook}
        />
        <ContextMenu.Item
          icon="users"
          label="Go to 1:1 room"
          onClick={() =>
            rooms.createOrEnterPrivateRoom(
              props.userId,
              privateRoomId,
              privateRoomSlug
            )
          }
        />
        <ContextMenu.Item
          icon="mail"
          label="Send message"
          onClick={() =>
            rooms.createOrEnterPrivateRoom(
              props.userId,
              privateRoomId,
              privateRoomSlug,
              true
            )
          }
        />
      </ContextMenu.Content>
    </ContextMenu.Root>
  )

  function createStatusHook() {
    if (!props.user) return

    dispatch(
      setStatusHook({
        userId: props?.user?.id,
        whenPresentAs:
          props.status?.status !== StatusModeKey?.Online
            ? StatusModeKey?.Online
            : undefined,
        whenActive: props.status?.status === StatusModeKey?.Online,
      })
    )
  }
}
