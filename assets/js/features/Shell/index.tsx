import React, { useEffect } from 'react'
import { styled } from 'themes'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Navigation, navigationBlur1 } from 'features/Navigation'
import { Titlebar } from 'features/Titlebar'
import { notifications } from 'lib/notifications'
import { Sidebar } from 'features/Sidebar'
import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { logger } from 'lib/log'
import { useHotkeys } from 'react-hotkeys-hook'
import { ShellRoot } from './ShellRoot'
import { CallProvider } from 'features/Call/Provider'

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

  return (
    <ShellRoot workspace>
      <Navigation />
      <Main>
        <Titlebar />
        <CallProvider>
          <Container>
            <Middle>{props.children}</Middle>
            <Sidebar />
          </Container>
        </CallProvider>
      </Main>
    </ShellRoot>
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
