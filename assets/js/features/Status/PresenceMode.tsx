import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import { PresenceMode, setPresenceAsFocus } from './slice'
import { Container, Label } from './Button'
import { useCommandRegistry } from 'features/CommandRegistry'

interface Props {}

const log = logger('status/presence')

export default function PresenceModeView(props: Props) {
  const dispatch = useDispatch()
  const { useRegister } = useCommandRegistry()

  const [userId, presence] = useSelector((state) => [
    selectors.users.getSelf(state)?.id,
    selectors.status.getSelfPresenceStatus(state),
  ])

  useRegister(
    (register) => {
      register(
        'Focus mode',
        () => {
          if (userId) dispatch(setPresenceAsFocus(userId))
        },
        {
          icon: 'headphones',
        }
      )

      register('Active mode', () => {})
      register('Away mode', () => {})
      register('Do not disturb mode', () => {})
    },
    [userId, presence]
  )

  const [icon, label] = modeProps(presence?.mode)

  return (
    <Container highlighted>
      <IconWrapper mode={presence?.mode}>
        <Icon name={icon} />
      </IconWrapper>
      <Label>{label}</Label>
    </Container>
  )
}

const IconWrapper = styled('div', {
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

export function modeProps(mode?: string): [string, string] {
  if (mode === PresenceMode.Active) return ['phoneCall', 'Active']
  if (mode === PresenceMode.DoNotDisturb) return ['night', 'Do Not Disturb']
  if (mode === PresenceMode.Away) return ['coffee', 'Away']

  return ['headphones', 'Focus']
}
