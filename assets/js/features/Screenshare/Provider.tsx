import React, { useEffect } from 'react'
import { useScreenShare } from '@daily-co/daily-react-hooks'
import { CommandType } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { Button } from 'features/Dock/Button'
import { useHotkeys } from 'react-hotkeys-hook'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { useSelector } from 'state'
import { PresenceMode } from 'features/Dock/slice'

interface Props {}

const log = logger('screenshare/provider')

export function ScreenshareProvider(props: Props) {
  const { useRegister } = useCommandRegistry()
  const { isSharingScreen, startScreenShare, stopScreenShare } =
    useScreenShare()

  const [isActive] = useSelector((state) => [
    selectors.dock.getSelfPresenceStatus(state)?.mode === PresenceMode.Active,
  ])

  useHotkeys(
    'meta+p',
    toggle,
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isSharingScreen]
  )

  useEffect(() => {
    if (!isActive && isSharingScreen) {
      stop()
    }
  }, [isActive])

  useRegister(
    (register) => {
      register('Present your screen', start, {
        icon: 'projector',
        keywords: ['share', 'start', 'screen'],
        shortcut: ['cmd', 'p'],
        type: CommandType.Misc,
        when: !isSharingScreen && isActive,
      })

      register('Stop presenting screen', stop, {
        icon: 'projector',
        keywords: ['share'],
        shortcut: ['cmd', 'p'],
        type: CommandType.Misc,
        when: isSharingScreen,
      })
    },
    [isSharingScreen, startScreenShare, stopScreenShare]
  )

  return <></>

  function start() {
    if (!isActive) return

    log.info('Start presenting screen')
    startScreenShare()
  }

  function stop() {
    log.info('Stop presenting')
    stopScreenShare()
  }

  function toggle() {
    if (isSharingScreen) {
      stop()
    } else {
      start()
    }
  }
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
