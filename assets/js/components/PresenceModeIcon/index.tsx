import { styled } from 'themes'
import React from 'react'
import Icon from 'components/Icon'
import { PresenceStatus } from 'state/presence'
import { findModeByStatus } from 'state/presence'

interface Props {
  mode: PresenceStatus
  active?: boolean
  onClick?: () => void
}

export function PresenceModeIcon(props: Props) {
  const icon = getIcon(props.mode, props.active || false)

  return (
    <Container
      status={props.active ? 'active' : props.mode}
      onClick={props.onClick}
    >
      {icon ? <Icon name={icon} /> : null}
    </Container>
  )
}

export function getIcon(
  status: PresenceStatus,
  active: boolean
): string | undefined {
  if (active) return 'phoneCall'
  return findModeByStatus(status)?.icon
}

export const Container = styled('div', {
  variants: {
    status: {
      active: {
        '& svg': {
          color: '$presenceModelineActiveFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(38, 181, 206, 0.9))',
        },
      },
      focus: {
        '& svg': {
          color: '$presenceModelineFocusFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(242, 201, 76, 0.9))',
        },
      },
      online: {
        '& svg': {
          color: '$presenceModelineOnlineFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(38, 181, 206, 0.9))',
        },
      },
      zen: {
        '& svg': {
          color: '$presenceModelineZenFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(235, 87, 87, 0.9))',
        },
      },
    },
  },
})
