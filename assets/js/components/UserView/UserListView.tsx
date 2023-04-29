import { styled } from 'themes'
import React from 'react'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { StatusIcon, StyledStatusIcon } from 'features/Dock/StatusIcon'
import { Status, User } from 'state/entities'
import { UserContextMenuView } from 'components/UserContextMenu/UserContextMenuView'
import { StatusHook } from 'features/Tap/slice'
import { UserStatusLabel } from 'components/UserStatus/Label'
import { Emoji } from 'components/Emoji'

interface Props {
  userId: string
  user?: User
  status?: Status
  small?: boolean
  tap: (userId: string) => void
  existingHook?: StatusHook
  isOnline: boolean
  createStatusHook: (userId: string) => void
}

export function UserListView(props: Props) {
  //const localTime = useMemo(() => {}, [props.userId])
  const localTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: props.status?.timezone,
  })

  return (
    <UserContextMenuView
      userId={props.userId}
      user={props.user}
      status={props.status}
      tap={props.tap}
      existingHook={props.existingHook}
      isOnline={props.isOnline}
      createStatusHook={props.createStatusHook}
    >
      <Root>
        <Left>
          <Avatar
            src={props.user?.profile_photo_url}
            fallback={props.user?.name || 'User ' + props.userId}
          />
          <StatusIcon status={props.status} isOnline={props.isOnline} noEmoji />
        </Left>
        <Right>
          <Username>
            {props.user?.name}
            {props.status?.emoji ? <Emoji id={props.status.emoji} /> : null}
          </Username>
          <Status>
            <LocalTime>{localTime}</LocalTime>
            <UserStatusLabel status={props.status} isOnline={props.isOnline} />
          </Status>
        </Right>
      </Root>
    </UserContextMenuView>
  )
}

const Username = styled('div', {
  label: true,
  color: '$electronTrayUsernameFg',
  fontWeight: '$medium',
  lineHeight: '1',
  '& em-emoji': {
    position: 'relative',
    display: 'inline-block',
    width: '18px',
    '& span': {
      position: 'relative',
      left: '2px',
      fontSize: '16px',
    },
  },
})

const Status = styled('div', {
  label: true,
  ellipsis: true,
  color: '$electronTrayUserStatusFg',
  fontWeight: '$medium',
  fontSize: '12px',
})

const Root = styled('div', {
  aspectRatio: '1',
  display: 'flex',
  height: '100%',
  minHeight: '36px',
  width: '100%',
  gap: '8px',
  [`& ${AvatarRoot}`]: {
    height: '100%',
    round: 'medium',
  },
  [`& ${StyledStatusIcon}`]: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    border: '1.5px solid $shellBg',
    round: true,
  },
})

const Left = styled('div', {
  height: '100%',
  display: 'flex',
  vcenter: true,
  position: 'relative',
  aspectRatio: '1',
})

const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '4px',
  ellipsis: true,
  overflow: 'hidden',
  width: '100%',
})

const LocalTime = styled('label', {
  label: true,
  fontSize: '12px',
  fontWeight: '$medium',
  '&::after': {
    marginLeft: '2px',
    marginRight: '2px',
    content: '·',
  },
})
