import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { styled } from 'themes'
import { logger } from 'lib/log'
import { ParticipantGrid } from './ParticipantGrid'

import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { RoomButton } from './RoomButton'
import { isElectron } from 'lib/electron'

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
      <Dock roomId={props.id} />
    </Container>
  )
}

const RequestAccess = styled('button', {
  background: 'transparent',
  padding: '12px 36px',
  color: '$white',
  border: '1px solid $silver',
  pointer: 'default',
  fontSize: '$base',
  round: 'large',
})

export const topBlurEffect =
  'radial-gradient(1000px at 200px -700px, $shellBlur1, transparent)'

const Container = styled('main', {
  width: '100%',
  display: 'grid',
  gridTemplateRows: 'calc(16 * 4px) auto calc(28 * 4px)',
  backgroundImage: topBlurEffect,
  variants: {
    electron: {
      true: {
        gridTemplateRows: 'auto calc(28 * 4px)',
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
