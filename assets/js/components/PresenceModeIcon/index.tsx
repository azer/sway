import { styled } from 'themes'
import React from 'react'
import Icon from 'components/Icon'
import { PresenceMode } from 'state/entities'

interface Props {
  mode: PresenceMode
  active?: boolean
  onClick?: () => void
}

export function PresenceModeIcon(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <Container active={props.active} mode={props.mode} onClick={props.onClick}>
      <Icon name={getIcon(props.mode, props.active || false)} />
    </Container>
  )
}

export function getIcon(mode: string, active: boolean): string {
  if (active) return 'phoneCall'
  if (mode === PresenceMode.Social) return 'eye'
  if (mode === PresenceMode.Solo) return 'incognito'
  if (mode === PresenceMode.Zen) return 'sunrise'
  return 'headphones'
}

export function getLabel(mode: string): string {
  if (mode === PresenceMode.Social) return 'Social'
  if (mode === PresenceMode.Solo) return 'Solo'
  if (mode === PresenceMode.Zen) return 'Zen'
  return 'Focus'
}

export function getDesc(mode: string): string {
  if (mode === PresenceMode.Social) return 'Be present, visible.'
  if (mode === PresenceMode.Solo) return 'Private and selective.'
  if (mode === PresenceMode.Zen) return 'Calm, undisturbed.'
  return 'Productive and responsive.'
}

export const Container = styled('div', {
  variants: {
    mode: {
      solo: {
        '& svg': {
          color: '$presenceModelineSoloFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(255, 93, 224, 0.7))',
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
      social: {
        '& svg': {
          color: '$presenceModelineSocialFg',
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
    active: {
      true: {
        '& svg': {
          color: '$presenceModelineActiveFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(38, 181, 206, 0.9))',
        },
      },
    },
  },
})
