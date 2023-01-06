import { styled } from 'themes'
import React from 'react'
import { PresenceMode } from 'features/Dock/slice'
import Icon from 'components/Icon'

interface Props {
  mode: PresenceMode
  onClick: () => void
}

export function PresenceModeIcon(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <Container mode={props.mode} onClick={props.onClick}>
      <Icon name={getIcon(props.mode)} />
    </Container>
  )
}

export function getIcon(mode: string): string {
  if (mode === PresenceMode.Active) return 'phoneCall'
  if (mode === PresenceMode.DoNotDisturb) return 'night'
  if (mode === PresenceMode.Away) return 'coffee'
  return 'headphones'
}

export function getLabel(mode: string): string {
  if (mode === PresenceMode.Active) return 'Active'
  if (mode === PresenceMode.DoNotDisturb) return 'Do Not Disturb'
  if (mode === PresenceMode.Away) return 'Away'
  return 'Focus'
}

export const Container = styled('div', {
  variants: {
    mode: {
      away: {
        '& svg': {
          color: '$presenceModelineAwayFg',
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
      active: {
        '& svg': {
          color: '$presenceModelineActiveFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(38, 181, 206, 0.9))',
        },
      },
      do_not_disturb: {
        '& svg': {
          color: '$presenceModelineDndFg',
        },
        '& svg path': {
          filter: 'drop-shadow(0px 0px 4px rgba(235, 87, 87, 0.9))',
        },
      },
    },
  },
})
