import React from 'react'
import { styled } from 'themes'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Navigation, navigationBlur1 } from 'features/Navigation'
import { PresenceStatus } from 'state/presence'
import { Titlebar } from 'features/Titlebar'
import { globalCss } from '@stitches/react'
import { isElectron } from 'lib/electron'

interface Props {
  children?: React.ReactNode
}

export function Shell(props: Props) {
  const [localStatus] = useSelector((state) => [
    selectors.statuses.getLocalStatus(state),
  ])

  globalStyles()

  return (
    <Viewport electron={isElectron}>
      {isElectron ? <Titlebar /> : null}
      <Container electron={isElectron} status={localStatus.status}>
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
  `radial-gradient(440px at calc(50% + 100px) calc(100vh + 300px), ${color}, transparent)`

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
        minHeight: 'calc(100vh - 48px)',
      },
    },
    status: {
      [PresenceStatus.Online]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineSocialBlur')}`,
      },
      [PresenceStatus.Zen]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineZenBlur')}`,
      },
      [PresenceStatus.Focus]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineFocusBlur')}`,
      },
    },
  },
})
