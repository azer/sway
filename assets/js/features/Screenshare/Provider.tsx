import React, { useEffect } from 'react'
import { CommandType } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { Button } from 'features/Dock/Button'
import { useHotkeys } from 'react-hotkeys-hook'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { useSelector } from 'state'
import { useScreenShare } from './use-screenshare'

interface Props { }

const log = logger('screenshare/provider')

export function ScreenshareProvider(props: Props) {
  const { useRegister } = useCommandRegistry()
  const screenshare = useScreenShare()

  const [isActive] = useSelector((state) => [
    selectors.presence.isLocalUserActive(state),
  ])

  useHotkeys(
    'meta+p',
    screenshare.toggle,
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [screenshare.isSharingScreen]
  )

  useEffect(() => {
    if (!isActive && screenshare.isSharingScreen) {
      screenshare.stop()
    }
  }, [screenshare.isSharingScreen, isActive, screenshare.stop])

  useRegister(
    (register) => {
      register('Present your screen', screenshare.start, {
        icon: 'projector',
        keywords: ['share', 'start', 'screen'],
        shortcut: ['cmd', 'p'],
        type: CommandType.Misc,
        when: !screenshare.isSharingScreen && isActive,
      })

      register('Stop presenting screen', screenshare.stop, {
        icon: 'projector',
        keywords: ['share'],
        shortcut: ['cmd', 'p'],
        type: CommandType.Misc,
        when: screenshare.isSharingScreen,
      })
    },
    [isActive, screenshare.isSharingScreen]
  )

  return <></>
}

export function ScreenshareButton(props: {
  isSharingScreen: boolean
  startScreenShare: () => void
  stopScreenShare: () => void
}) {
  const [isActive] = useSelector((state) => [
    selectors.presence.isLocalUserActive(state),
  ])

  if (!isActive) return <></>

  const label = props.isSharingScreen
    ? 'Stop presenting your screen'
    : 'Present your screen'

  return (
    <Button
      icon="projector"
      label={label}
      on={props.isSharingScreen}
      onClick={toggle}
      tooltipLabel={
        props.isSharingScreen ? 'Stop presenting screen' : 'Present your screen'
      }
    />
  )

  function toggle() {
    if (props.isSharingScreen) {
      props.stopScreenShare()
    } else {
      props.startScreenShare()
    }
  }
}
