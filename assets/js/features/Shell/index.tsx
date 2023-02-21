import React from 'react'
import { styled } from 'themes'
import Sidebar from 'features/Sidebar'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Navigation, navigationBlur1 } from 'features/Navigation'
import { PresenceMode } from 'state/entities'
import { Titlebar } from 'features/Titlebar'
import { topBlurEffect } from 'features/Room'
import { globalCss } from '@stitches/react'
import { isElectron } from 'lib/electron'

interface Props {
  children?: React.ReactNode
}

export function Shell(props: Props) {
  const [presenceMode] = useSelector((state) => [
    selectors.presence.getSelfStatus(state),
  ])

  globalStyles()

  return (
    <Viewport electron={isElectron}>
      {isElectron ? <Titlebar /> : null}
      <Container electron={isElectron} mode={presenceMode?.status}>
        <Navigation />
        {props.children}
      </Container>
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
  `radial-gradient(440px at 50% calc(100vh + 300px), ${color}, transparent)`

const Viewport = styled('div', {
  width: '100vw',
  minHeight: '100vh',
  backgroundColor: '$shellBg',
  variants: {
    electron: {
      true: {
        backgroundImage: `${navigationBlur1}, radial-gradient(1000px at 500px -700px, $shellBlur1, transparent)`,
      },
    },
  },
})

const Container = styled('main', {
  width: '100vw',
  minHeight: '100vh',
  color: '$shellFg',
  display: 'grid',
  gridTemplateColumns: '220px auto',
  overflow: 'hidden',
  variants: {
    electron: {
      true: {
        minHeight: 'calc(100vh - 40px)',
      },
    },
    mode: {
      [PresenceMode.Social]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineSocialBlur')}`,
      },
      [PresenceMode.Solo]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineSoloBlur')}`,
      },
      [PresenceMode.Zen]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineZenBlur')}`,
      },
      [PresenceMode.Focus]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineFocusBlur')}`,
      },
    },
  },
})
