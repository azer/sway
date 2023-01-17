import React from 'react'
import { styled } from 'themes'
import Sidebar from 'features/Sidebar'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Navigation } from 'features/Navigation'
import { PresenceMode } from 'state/entities'

interface Props {
  children?: React.ReactNode
}

export function Shell(props: Props) {
  const [presenceMode] = useSelector((state) => [
    selectors.presence.getSelfStatus(state),
  ])

  return (
    <Container mode={presenceMode?.status}>
      <Navigation />
      {props.children}
      <Sidebar />
    </Container>
  )
}

const bottomBlurEffect = (color: string) =>
  `radial-gradient(440px at 50% calc(100vh + 300px), ${color}, transparent)`

const Container = styled('main', {
  backgroundColor: '$shellBg',
  color: '$shellFg',
  width: '100vw',
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '220px auto 220px',
  overflow: 'hidden',
  variants: {
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
