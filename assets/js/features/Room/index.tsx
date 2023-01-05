import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useUserSocket } from 'features/UserSocket'
import { useDispatch, useSelector } from 'state'
import { styled } from 'themes'
import logger from 'lib/log'
import {
  ConnectionState,
  setBafaRoomConnectionStatus,
} from 'features/Dock/slice'
import { ParticipantGrid } from './ParticipantGrid'
import { CallProvider } from 'features/Call/Provider'
import { Dock } from 'features/Dock'
// import { useSelector, useDispatch } from 'app/state'

interface Props {
  id: string
}

const log = logger('room')

export default function Room(props: Props) {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const { channel } = useUserSocket()

  const [localUser, room, isSocketConnected] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.rooms.getRoomById(state, props.id),
    selectors.rooms.getUsersInRoom(state, props.id),
    selectors.dock.isBafaSocketConnected(state),
  ])

  useEffect(() => {
    if (!room || !channel || !localUser || !isSocketConnected) return

    dispatch(
      setBafaRoomConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    channel.push('rooms:join', { id: room.id })
  }, [channel, room, localUser, isSocketConnected])

  useEffect(() => {
    if (!channel) return
    channel.on('rooms:join', handleJoin)
  }, [channel])

  return (
    <CallProvider>
      <Container>
        <Header>
          <Title>
            <Hash>#</Hash>
            {room?.name}
          </Title>
        </Header>
        <ParticipantGrid roomId={props.id} />
        <Dock roomId={props.id} />
      </Container>
    </CallProvider>
  )

  function handleJoin(payload: { id: string; user_id: string }) {
    if (String(payload.user_id) === localUser?.id) {
      dispatch(
        setBafaRoomConnectionStatus({
          userId: localUser.id,
          state: ConnectionState.Successful,
        })
      )
    }
  }
}

const topBlurEffect =
  'radial-gradient(1000px at 200px -700px, $shellBlur1, transparent)'

const Container = styled('main', {
  width: '100%',
  display: 'grid',
  gridTemplateRows: 'calc(16 * 4px) auto calc(28 * 4px)',
  backgroundImage: topBlurEffect,
})

const Header = styled('header', {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  space: { inner: [0, 5] },
  borderBottom: '1px solid $shellBorderColor',
})

const Title = styled('div', {
  baselineBlock: 10,
  baselineFontSize: 'base',
  fontWeight: '$medium',
  label: true,
  color: '$roomTitleFg',
})

const Hash = styled('label', {
  marginRight: '1.4px',
  fontSize: '$base',
  label: true,
})
