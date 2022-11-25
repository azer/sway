import React from 'react'
import { styled } from 'themes'
import Room from 'features/Room'
import Navigation from 'features/Navigation'
import Sidebar from 'features/Sidebar'
import selectors from 'selectors'
import { useSelector } from 'state'
import { PresenceMode } from 'features/Status/slice'

interface Props {
  children?: React.ReactNode
}

export default function Shell(props: Props) {
  const [presenceMode] = useSelector((state) => [
    selectors.status.getSelfPresenceStatus(state),
  ])

  return (
    <Container mode={presenceMode?.mode}>
      <Navigation />
      {props.children}
      <Sidebar />
    </Container>
  )
}

const topBlurEffect =
  'radial-gradient(440px at 300px -300px, $shellBlur1, transparent)'

const bottomBlurEffect = (color: string) =>
  `radial-gradient(440px at 50% calc(100vh + 300px), ${color}, transparent)`

const Container = styled('main', {
  backgroundColor: '$shellBg',
  backgroundImage: topBlurEffect,
  color: '$shellFg',
  width: '100vw',
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '220px auto 220px',
  overflow: 'hidden',
  variants: {
    mode: {
      [PresenceMode.Active]: {
        backgroundImage: `${topBlurEffect}, ${bottomBlurEffect(
          '$presenceModelineActiveBlur'
        )}`,
      },
      [PresenceMode.Away]: {
        backgroundImage: `${topBlurEffect}, ${bottomBlurEffect(
          '$presenceModelineAwayBlur'
        )}`,
      },
      [PresenceMode.DoNotDisturb]: {
        backgroundImage: `${topBlurEffect}, ${bottomBlurEffect(
          '$presenceModelineDndBlur'
        )}`,
      },
      [PresenceMode.Focus]: {
        backgroundImage: `${topBlurEffect}, ${bottomBlurEffect(
          '$presenceModelineFocusBlur'
        )}`,
      },
    },
  },
})
