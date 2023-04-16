import { Avatar, AvatarRoot } from 'components/Avatar'
import { Emoji } from 'components/Emoji'
import { StatusHeader, Right, StyledStatus } from 'components/StatusUpdate'
import { StatusIcon, StyledStatusIcon } from 'features/Dock/StatusIcon'
import { firstName } from 'lib/string'
import React from 'react'
import { Status, User } from 'state/entities'
import { findModeByStatus } from 'state/presence'
import { styled } from 'themes'

interface Props {
  user?: User
  status?: Status
  online?: boolean
}

export function UserHeader(props: Props) {
  return (
    <Container>
      {props.status ? (
        <StatusIcon status={props.status} noEmoji isOnline={props.online} />
      ) : null}
      <Avatar
        src={props.user?.profile_photo_url}
        alt={props.user?.name}
        fallback={props.user?.name || 'User'}
      />
      <Right>
        <StatusHeader>
          {firstName(props.user?.name || '')}
          {props.status?.emoji ? <Emoji id={props.status.emoji} /> : null}
        </StatusHeader>
        <StyledStatus>
          {props.status
            ? props.status?.message ||
              findModeByStatus(props.status.status)?.label
            : ''}
        </StyledStatus>
      </Right>
    </Container>
  )
}

const Container = styled('div', {
  display: 'flex',
  minWidth: '175px',
  padding: '4px 4px 0 4px',
  height: '48px',
  gap: '8px',
  position: 'relative',
  [`& ${AvatarRoot}`]: {
    height: '100%',
  },
  [`& ${StyledStatusIcon}`]: {
    position: 'absolute',
    top: '36px',
    left: '36px',
  },
})
