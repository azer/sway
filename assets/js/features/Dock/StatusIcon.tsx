import { Emoji } from 'components/Emoji'
import React from 'react'
import { Status } from 'state/entities'
import { PresenceStatus } from 'state/presence'
import { styled } from 'themes'

interface Props {
  status: Status
  noEmoji?: boolean
}

export function StatusIcon(props: Props) {
  return (
    <StyledStatusIcon>
      {props.status.emoji && !props.noEmoji ? (
        <Emoji id={props.status.emoji} size="1.35em" />
      ) : (
        <StatusCircle presence={props.status.status} />
      )}
    </StyledStatusIcon>
  )
}

export const StyledStatusIcon = styled('div', {
  center: true,
})

export const StatusCircle = styled('div', {
  width: '10px',
  aspectRatio: '1',
  round: true,
  variants: {
    presence: {
      [PresenceStatus.Focus]: {
        background: '$statusIconFocusBg',
      },
      [PresenceStatus.Online]: {
        background: '$statusIconOnlineBg',
      },
      [PresenceStatus.Zen]: {
        background: '$statusIconZenBg',
      },
    },
  },
})
