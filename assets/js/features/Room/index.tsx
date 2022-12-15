import React, { useCallback, useEffect, useState } from 'react'
import { DailyProvider } from '@daily-co/daily-react-hooks'
import selectors from 'selectors'
import { useUserSocket } from 'features/UserSocket'
import { useDispatch, useSelector } from 'state'
import { styled } from 'themes'
import { add, Users } from 'state/entities'
import { AvatarStack } from 'components/Avatar'
import Avatar from 'features/Avatar'
import logger from 'lib/log'
import Call from 'features/Call'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import StatusTray from 'features/Status'
import {
  ConnectionState,
  setBafaRoomConnectionStatus,
  setCallStatus,
  setDailyRoomConnectionStatus,
} from 'features/Status/slice'
// import { useSelector, useDispatch } from 'app/state'

interface Props {
  id: string
}

const roomUrl = 'https://shtest.daily.co/bafapublic'

const log = logger('room')

export default function Room(props: Props) {
  const dispatch = useDispatch()
  const [callObject, setCallObject] = useState<DailyCall>()
  // const [] = useSelector((state) => [])
  const { channel } = useUserSocket()

  const [localUser, room, usersInRoom, isSocketConnected] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.rooms.getRoomById(state, props.id),
      selectors.rooms.getUsersInRoom(state, props.id),
      selectors.status.isBafaSocketConnected(state),
    ]
  )

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

  useEffect(() => {
    if (!room || !localUser) return
    log.info('start joining', room, localUser)

    dispatch(
      setDailyRoomConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    startJoiningCall()
  }, [room, localUser])

  const startJoiningCall = useCallback(async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

    const newCallObject = DailyIframe.createCallObject({
      audioSource: false,
      videoSource: false,
      startVideoOff: true,
      startAudioOff: true,
    })
      .on('loading', logEvent)
      .on('loaded', logEvent)
      .on('left-meeting', logEvent)
      .on('started-camera', logEvent)
      .on('camera-error', logEvent)
      .on('joining-meeting', logEvent)
      .on('joined-meeting', logEvent)
      .on('participant-updated', logEvent)
      .on('participant-joined', logEvent)
      .on('participant-left', logEvent)
      .on('error', logEvent)
      .on('network-connection', logEvent)

    // await newCallObject.preAuth({ url })

    const joined = await newCallObject.join({
      userData: { id: localUser?.id, roomId: props.id },
      url: roomUrl,
    })

    if (joined && localUser) {
      dispatch(
        setDailyRoomConnectionStatus({
          userId: localUser.id,
          state: ConnectionState.Successful,
        })
      )

      dispatch(
        setCallStatus({
          userId: localUser.id,
          status: {
            dailyUserId: joined.local.user_id,
            bafaUserId: localUser.id,
            sessionId: joined.local.session_id,
            cameraOn: joined.local.video,
            screenOn: joined.local.screen,
            micOn: joined.local.audio,
          },
        })
      )
    }

    log.info('joined', joined)

    setCallObject(newCallObject)
  }, [localUser])

  const startLeavingCall = useCallback(() => {
    if (!callObject) return
    callObject.leave()
  }, [callObject])

  log.info('call object', callObject)

  return (
    <DailyProvider callObject={callObject}>
      <Container>
        <Header>
          <Title>
            <Hash>#</Hash>
            {room?.name}
          </Title>
          <UsersInRoom>
            <AvatarStack>
              {usersInRoom.map((id) => (
                <Avatar key={id} id={id} />
              ))}
            </AvatarStack>
          </UsersInRoom>
        </Header>
        <Call roomId={props.id}></Call>
        <StatusTray roomId={props.id} />
      </Container>
    </DailyProvider>
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

const Container = styled('main', {
  width: '100%',
  display: 'grid',
  gridTemplateRows: 'calc(16 * 4px) auto calc(28 * 4px)',
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

const UsersInRoom = styled('aside', {
  baselineBlock: 12,
  justifyContent: 'end',
})

function logEvent(e: any) {
  log.info('Daily event. Action: %s', e.action, e)
}
