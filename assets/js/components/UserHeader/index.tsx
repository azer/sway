import { Avatar, AvatarRoot } from 'components/Avatar'
import { Emoji } from 'components/Emoji'
import { StatusIcon, StyledStatusIcon } from 'features/Dock/StatusIcon'
import { firstName } from 'lib/string'
import React from 'react'
import { Status, User } from 'state/entities'
import { findModeByStatus } from 'state/presence'
import { styled } from 'themes'

interface Props {
  user?: User
  status?: Status
}

export function UserHeader(props: Props) {
  return (
    <Container>
      {props.status ? <StatusIcon status={props.status} noEmoji /> : null}
      <Avatar
        src={props.user?.photoUrl}
        alt={props.user?.name}
        fallback={props.user?.name || 'User'}
      />
      <Right>
        <Name>
          {firstName(props.user?.name || '')}
          {props.status?.emoji ? <Emoji id={props.status.emoji} /> : null}
        </Name>
        <Status>{props.status ? props.status?.message || findModeByStatus(props.status.status)?.label : ''}</Status>
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

    height: '100%'
  },
  [`& ${StyledStatusIcon}`]: {
    position: 'absolute',
    top: '36px',
    left: '36px'
  }
})

const EmojiColumn = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  fontSize: '21px',
  color: '$white',
  width: '36px',
  height: '100%',
  label: true,
  variants: {
    empty: {
      true: {
        width: '8px'
      }
    }
  }
})

const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  justifyContent: 'center',
  label: true
})

const Name = styled('div', {
  fontWeight: '$medium',
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '$base',
  '& em-emoji': {
    position: 'relative',
    display: 'inline-block',
    '& span': {
      position: 'absolute',
      bottom: '-3px',
      left: '2px',
      fontSize: '16px'
    }
  }
})

const Status = styled('div', {
  color: 'rgba(225, 232, 240, 0.5)',
  fontSize: '$small',

})
//const  = styled('div', {})
