import { Emoji } from 'components/Emoji'
import React from 'react'
import { Status } from 'state/entities'
import { StatusModeKey } from 'state/status'
import { styled } from 'themes'

interface Props {
  status?: Status
  noEmoji?: boolean
  isOnline?: boolean
  isActive?: boolean
}

export function StatusIcon(props: Props) {
  return (
    <StyledStatusIcon>
      {props.status?.emoji && !props.noEmoji && props.isOnline !== false ? (
        <Emoji id={props.status?.emoji} size="1.35em" />
      ) : (
        <StatusCircle
          presence={props.status?.status}
          isOnline={props.isOnline}
          isActive={props.isActive}
        />
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
      [StatusModeKey.Focus]: {
        background: '$statusIconFocusBg',
      },
      [StatusModeKey.Online]: {
        background: '$statusIconOnlineBg',
      },
      [StatusModeKey.Zen]: {
        background: '$statusIconZenBg',
      },
    },
    isActive: {
      true: {
        background: '$statusIconActiveBg !important',
      },
    },
    isOnline: {
      false: {
        background: '$statusIconOfflineBg !important',
      },
    },
  },
})
