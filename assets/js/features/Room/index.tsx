import React, { useEffect } from 'react'
import { styled } from 'themes'
import { logger } from 'lib/log'
import { ParticipantGrid } from './ParticipantGrid'

import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { RoomButton } from './RoomButton'
import { isElectron } from 'lib/electron'
import { CallDock } from 'features/CallDock'

// import { useSelector, useDispatch } from 'app/state'

interface Props {
  id: string
}

const log = logger('room')

export function RoomPage(props: Props) {
  return (
    <Container electron={isElectron}>
      <ScreenshareProvider />
      {!isElectron ? (
        <Header>
          <RoomButton roomId={props.id} />
        </Header>
      ) : null}
      <Top>
        <Dock roomId={props.id} />
      </Top>
      <ParticipantGrid roomId={props.id} />
      <Bottom>
        <CallDock />
      </Bottom>
    </Container>
  )
}

export const topBlurEffect =
  'radial-gradient(1000px at 200px -700px, $shellBlur1, transparent)'

const Container = styled('main', {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundImage: topBlurEffect,
  variants: {
    electron: {
      true: {
        gridTemplateRows: '80px auto 80px',
        background: 'none',
        paddingTop: '12px',
      },
    },
  },
})

const Header = styled('header', {
  width: '100%',
  height: '48px',
  display: 'flex',
  space: { inner: [0, 5] },
  borderBottom: '1px solid $shellBorderColor',
  vcenter: true,
})

const Top = styled('div', {
  center: true,
})

const Bottom = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  padding: '8px',
  marginBottom: '12px',
})
