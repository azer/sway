import React, { useEffect, useState } from 'react'
import { styled } from 'themes'
import { logger } from 'lib/log'
import { ParticipantGrid } from './ParticipantGrid'

import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { RoomButton } from './RoomButton'
import { isElectron } from 'lib/electron'
import { Mirror } from 'features/Mirror'

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
      <ParticipantGrid roomId={props.id} />
      <Bottom>
        <Dock roomId={props.id} />
        <BottomMiddle></BottomMiddle>
        <Mirror />
      </Bottom>
    </Container>
  )
}

export const topBlurEffect =
  'radial-gradient(1000px at 200px -700px, $shellBlur1, transparent)'

const Container = styled('main', {
  width: '100%',
  display: 'grid',
  gridTemplateRows: 'calc(16 * 4px) auto 80px',
  backgroundImage: topBlurEffect,
  variants: {
    electron: {
      true: {
        gridTemplateRows: 'auto 80px',
        background: 'none',
      },
    },
  },
})

const Header = styled('header', {
  width: '100%',
  display: 'flex',
  space: { inner: [0, 5] },
  borderBottom: '1px solid $shellBorderColor',
  vcenter: true,
})

const Bottom = styled('div', {
  display: 'flex',
  padding: '8px',
})

const BottomMiddle = styled('div', {
  flex: '1',
})
