import React from 'react'
import { entities } from 'state'
import { ContextMenu } from 'components/ContextMenu'
import { UserHeader } from 'components/UserHeader'
import { useSelector, useDispatch } from 'state'
import { setStatusHook } from 'features/Tap/slice'
import { PresenceStatus } from 'state/presence'
import selectors from 'selectors'

interface Props {
  children: React.ReactNode
  user?: entities.User
  status?: entities.Status
  tap: (userId: string) => void
}

export function UserContextMenu(props: Props) {
  const dispatch = useDispatch()

  const [existingHook, isOnline] = useSelector((state) => [
    selectors.taps.getStatusHookByUserId(state, props.user?.id || ''),
    selectors.presence.isUserOnline(state, props.user?.id || ''),
  ])

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
        <ContextMenu.Item icon="users" label="Go to 1:1 room" />
        <ContextMenu.Item icon="mail" label="Send message" />
      </ContextMenu.Content>
    </ContextMenu.Root>
  )

  function createStatusHook() {
    if (!props.user) return

    dispatch(
      setStatusHook({
        userId: props?.user?.id,
        whenPresentAs:
          props.status?.status !== PresenceStatus?.Online
            ? PresenceStatus?.Online
            : undefined,
        whenActive: props.status?.status === PresenceStatus?.Online,
      })
    )
  }
}
