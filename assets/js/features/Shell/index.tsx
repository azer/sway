import React from 'react'
import { styled } from 'themes'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Navigation, navigationBlur1 } from 'features/Navigation'
import { PresenceStatus } from 'state/presence'
import { Titlebar } from 'features/Titlebar'
import { globalCss } from '@stitches/react'
import { isElectron } from 'lib/electron'
import { notifications } from 'lib/notifications'
import Sidebar from 'features/Sidebar'

interface Props {
  children?: React.ReactNode
}

notifications.requestPermission()

export function Shell(props: Props) {
  const [localStatus] = useSelector((state) => [
    selectors.statuses.getLocalStatus(state),
  ])

  globalStyles()

  return (
    <Viewport electron={isElectron}>
      <Navigation />
      <Main>
        <Titlebar />
        <Container electron={isElectron} status={localStatus.status}>
          <Middle>{props.children}</Middle>
          <Sidebar />
        </Container>
      </Main>
    </Viewport>
  )
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
  variants: {
    electron: {
      true: {},
    },
    status: {
      [PresenceStatus.Online]: {
        //backgroundImage: `${bottomBlurEffect('$presenceModelineSocialBlur')}`,
      },
      [PresenceStatus.Zen]: {
        //backgroundImage: `${bottomBlurEffect('$presenceModelineZenBlur')}`,
      },
      [PresenceStatus.Focus]: {
        //backgroundImage: `${bottomBlurEffect('$presenceModelineFocusBlur')}`,
      },
    },
  },
})

const Middle = styled('div', {
  flex: '1',
  height: '100%',
  padding: '12px',
})

const Main = styled('main', {
  flex: '1',
})
