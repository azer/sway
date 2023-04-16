import { styled } from 'themes'
import React from 'react'
import { firstName } from 'lib/string'
import { Avatar } from 'components/Avatar'
import { Emoji } from 'components/Emoji'
import { Timestamp } from 'components/Timestamp'

interface Props {
  id: string
  username: string
  emoji: string
  status: string
  profilePhotoUrl: string
  insertedAt: string | undefined
}

export function StatusUpdate(props: Props) {
  return (
    <StyledStatusUpdate data-id={props.id}>
      <Avatar
        src={props.profilePhotoUrl}
        alt={props.username}
        fallback={props.username || 'User'}
      />
      <Right>
        <StyledStatus>
          {props.status}
          {props.emoji ? <Emoji id={props.emoji} /> : null}
        </StyledStatus>
        <StatusHeader>
          <Author>{firstName(props.username || '')}</Author>
          <Date>
            {props.insertedAt ? (
              <Timestamp date={props.insertedAt} short />
            ) : null}
          </Date>
        </StatusHeader>
      </Right>
    </StyledStatusUpdate>
  )
}

export const StyledStatusUpdate = styled('div', {
  display: 'flex',
  gap: '8px',
})

export const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  justifyContent: 'center',
  label: true,
})

export const StatusHeader = styled('header', {
  fontWeight: '$medium',
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '$base',
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

export const StyledStatus = styled('div', {
  color: 'rgba(225, 232, 240, 0.5)',
  fontSize: '$small',
})

const Date = styled('span', {
  marginLeft: '4px',
  color: '$chatMessageDateFg',
  fontSize: '$small',
  fontWeight: '$medium',
  lineHeight: '17px',
})

const Author = styled('label', {
  margin: '0 4px',
})
