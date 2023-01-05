import React from 'react'
import { styled } from 'themes'
import Sidebar from 'features/Sidebar'
import selectors from 'selectors'
import { useSelector } from 'state'
import { PresenceMode } from 'features/Dock/slice'
import { Navigation } from 'features/Navigation'

interface Props {
  children?: React.ReactNode
}

export function Shell(props: Props) {
  const [presenceMode] = useSelector((state) => [
    selectors.dock.getSelfPresenceStatus(state),
  ])

  return (
    <Container mode={presenceMode?.mode}>
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
      [PresenceMode.Active]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineActiveBlur')}`,
      },
      [PresenceMode.Away]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineAwayBlur')}`,
      },
      [PresenceMode.DoNotDisturb]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineDndBlur')}`,
      },
      [PresenceMode.Focus]: {
        backgroundImage: `${bottomBlurEffect('$presenceModelineFocusBlur')}`,
      },
    },
  },
})
