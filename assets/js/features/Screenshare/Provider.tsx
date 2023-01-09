import React from 'react'
import { useScreenShare } from '@daily-co/daily-react-hooks'
import { CommandType } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { Button } from 'features/Dock/Button'

interface Props {}

export function ScreenshareProvider(props: Props) {
  const { useRegister } = useCommandRegistry()
  const { isSharingScreen, startScreenShare, stopScreenShare } =
    useScreenShare()

  useRegister(
    (register) => {
      register('Present your screen', () => startScreenShare(), {
        icon: 'projector',
        type: CommandType.Misc,
        when: !isSharingScreen,
      })

      register('Stop presenting screen', stopScreenShare, {
        icon: 'projector',
        type: CommandType.Misc,
        when: isSharingScreen,
      })
    },
    [isSharingScreen]
  )

  return <></>
}

export function ScreenshareButton(props: {}) {
  const { isSharingScreen, startScreenShare, stopScreenShare } =
    useScreenShare()

  const label = isSharingScreen
    ? 'Stop presenting your screen'
    : 'Present your screen'

  return (
    <Button
      icon="projector"
      label={label}
      off={!isSharingScreen}
      on={isSharingScreen}
      onClick={toggle}
    />
  )

  function toggle() {
    if (isSharingScreen) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }
}
