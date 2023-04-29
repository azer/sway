import React from 'react'
import { entities } from 'state'
import { ContextMenu } from 'components/ContextMenu'
import { UserHeader } from 'components/UserHeader'
import { StatusHook } from 'features/Tap/slice'

interface Props {
  userId: string
  children: React.ReactNode
  user?: entities.User
  status?: entities.Status
  tap: (userId: string) => void
  existingHook: StatusHook | undefined
  isOnline: boolean
  createStatusHook: (userId: string) => void
}

export function UserContextMenuView(props: Props) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{props.children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <UserHeader
          user={props.user}
          status={props.status}
          online={props.isOnline}
        />
        <ContextMenu.Separator />
        <ContextMenu.Item
          emoji="wave"
          label="Wave"
          onClick={() => props.tap(props.userId)}
        />
        <ContextMenu.Item
          icon={props.existingHook ? 'checkmark' : 'bell'}
          label="Notify when available"
          onClick={() => props.createStatusHook(props.userId)}
        />
        <ContextMenu.Item icon="users" label="Go to 1:1 room" />
        <ContextMenu.Item icon="mail" label="Send message" />
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
