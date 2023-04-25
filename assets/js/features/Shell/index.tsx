import React, { useEffect } from 'react'
import { styled } from 'themes'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Navigation, navigationBlur1 } from 'features/Navigation'
import { PresenceStatus } from 'state/presence'
import { Titlebar } from 'features/Titlebar'
import { globalCss } from '@stitches/react'
import { isElectron } from 'lib/electron'
import { notifications } from 'lib/notifications'
import { Sidebar } from 'features/Sidebar'
import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { logger } from 'lib/log'
import { useHotkeys } from 'react-hotkeys-hook'

interface Props {
  children?: React.ReactNode
}

notifications.requestPermission()

const log = logger('shell')

export function Shell(props: Props) {
  const { commands, add } = useCommandRegistry()
  const commandPalette = useCommandPalette()

  const [localStatus] = useSelector((state) => [
    selectors.statuses.getLocalStatus(state),
  ])

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== 'cmdk') return
    commandPalette.setCommands(Object.values(commands))
  }, [commandPalette.isOpen, commandPalette.id, commands])

  useHotkeys(
    'meta+k',
    onPressCommandK,
    {
      enableOnFormTags: true,
    },
    [commandPalette.isOpen]
  )

  globalStyles()

  return (
    <Viewport>
      <Navigation />
      <Main>
        <Titlebar />
        <Container status={localStatus.status}>
          <Middle>{props.children}</Middle>
          <Sidebar />
        </Container>
      </Main>
    </Viewport>
  )

  function onPressCommandK() {
    if (commandPalette.isOpen) commandPalette.close()

    log.info('Opening command palette')

    commandPalette.open([], {
      id: 'cmdk',
      title: 'Sway Command',
      icon: 'command',
      placeholder: '',
    })
  }
}

const globalStyles = globalCss({
  html: {
    background: '$shellBg',
    overflow: 'hidden',
  },
  body: {
    background: '$shellBg',
    overflow: 'hidden',
  },
  '::selection': {
    background: '$textSelectionBg',
    color: '$textSelectionFg',
  },
})

const bottomBlurEffect = (color: string) =>
  `radial-gradient(440px at calc(50% + 100px) calc(100vh + 300px), ${color}, transparent)`

const Viewport = styled('div', {
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  backgroundColor: '$shellBg',
  backgroundImage: `${navigationBlur1}, radial-gradient(1000px at 500px -700px, $shellBlur1, transparent)`,
})

const Container = styled('main', {
  flex: '1',
  minHeight: 'calc(100vh - 48px)',
  color: '$shellFg',
  display: 'flex',
  overflow: 'hidden',
})

const Middle = styled('div', {
  flex: '1',
  height: '100%',
  padding: '12px',
})

const Main = styled('main', {
  flex: '1',
})
