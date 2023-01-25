import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useUserSocket } from 'features/UserSocket'
import { entities, useDispatch, useSelector } from 'state'
import { styled } from 'themes'
import logger from 'lib/log'
import {
  ConnectionState,
  setSwayRoomConnectionStatus,
} from 'features/Dock/slice'
import { ParticipantGrid } from './ParticipantGrid'

import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { Channel } from 'phoenix'
import { appendToOrgRoomIds, setOrgRoomIds } from './slice'
import { add, addBatch, Room, Room, Rooms, toStateEntity } from 'state/entities'
import { useNavigate } from 'react-router-dom'
import { useCommandRegistry } from 'features/CommandRegistry'
import { Command, useCommandPalette } from 'features/CommandPalette'
import Icon from 'components/Icon'

// import { useSelector, useDispatch } from 'app/state'

interface Props {
  id: string
}

const log = logger('room')

export default function Room(props: Props) {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const { channel } = useUserSocket()
  const navigate = useNavigate()

  const [localUser, room, isSocketConnected] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.rooms.getRoomById(state, props.id),
    selectors.rooms.getUsersInRoom(state, props.id),
    selectors.dock.isSwaySocketConnected(state),
  ])

  const commandPalette = useCommandPalette()
  const { useRegister } = useCommandRegistry()

  useRegister(
    (register, registerPaletteCmd) => {
      if (!room || !channel || !localUser) return

      registerPaletteCmd(createRoomModal(channel, localUser.orgId), () => [])
      registerPaletteCmd(renameRoomModal(channel, room), () =>
        renameRoomCmd(room)
      )
      registerPaletteCmd(deleteRoomModal(channel, room), () =>
        deleteRoomCmd(channel, room)
      )
    },
    [channel, room, localUser]
  )

  useEffect(() => {
    if (!channel) return

    channel.on('rooms:update', (payload: Room) => {
      log.info('update room', payload)

      dispatch(
        add({
          table: Rooms,
          id: payload.id,
          record: toStateEntity(Rooms, payload),
        })
      )
    })

    channel.on('rooms:create', (payload: { all: Room[]; created: Room }) => {
      log.info('create message received', payload)

      dispatch(setOrgRoomIds(payload.all.map((r) => String(r.id))))

      dispatch(
        addBatch(
          payload.all.map((r) => ({
            id: r.id,
            table: entities.Rooms,
            record: toStateEntity(entities.Rooms, r),
          }))
        )
      )
    })
  }, [channel])

  /*
  const [hasCamAndMicAccess, setHasCamAndMicAccess] = useState(true)

  useEffect(() => {
    const checkcamAndMicAccess = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices
          .filter((device) => device.kind === 'videoinput')
          .filter((d) => d.deviceId !== '')
        const microphones = devices.filter(
          (device) => device.kind === 'audioinput'
        )
        log.info('cameras', cameras)
        setHasCamAndMicAccess(cameras.length > 0)
      } catch (err) {
        setHasCamAndMicAccess(false)
      }
    }

    checkcamAndMicAccess()
    }, [])


    {hasCamAndMicAccess ? (

      ) : (
        <Error>
          <RequestAccess onClick={requestAccess}>
            Grant camera & microphone access
          </RequestAccess>
        </Error>
      )}*/

  useEffect(() => {
    if (!room || !channel || !localUser || !isSocketConnected) return

    dispatch(
      setSwayRoomConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    // FIXME:
    // Change the room when user triggers
    // Navigating to a room
    // Or receiving a new status
    channel.push('rooms:join', { id: room.id })
  }, [channel, room, localUser, isSocketConnected])

  useEffect(() => {
    if (!channel) return
    channel.on('rooms:join', handleJoin)
  }, [channel])

  return (
    <Container>
      <ScreenshareProvider />
      <Header>
        <Title onClick={openRoomCommands}>
          <TitleBg />
          <Hash>
            <Icon name="hashtag" />
          </Hash>
          <Label>{room?.name}</Label>
        </Title>
      </Header>
      <ParticipantGrid roomId={props.id} />

      <Dock roomId={props.id} />
    </Container>
  )

  function handleJoin(payload: { id: string; user_id: string }) {
    if (String(payload.user_id) === localUser?.id) {
      dispatch(
        setSwayRoomConnectionStatus({
          userId: localUser.id,
          state: ConnectionState.Connected,
        })
      )
    }
  }

  function openRoomCommands() {
    if (!channel || !localUser) return

    commandPalette.open(
      [
        {
          id: 'rename-room-' + room.id,
          name: 'Rename #' + room.name,
          icon: 'edit',
          palette: {
            modal: () => renameRoomModal(channel, room),
            commands: () => renameRoomCmd(room),
          },
        },
        {
          id: 'delete-room-' + room.id,
          name: 'Delete #' + room.name,
          icon: 'trash',
          palette: {
            modal: () => deleteRoomModal(channel, room),
            commands: () => deleteRoomCmd(channel, room),
          },
        },
        {
          id: 'craete-new-room',
          name: 'Create New Room',
          icon: 'plus',
          palette: {
            modal: () => createRoomModal(channel, localUser.orgId),
            commands: () => [],
          },
        },
      ],
      {
        id: 'room-nav',
        title: 'Room Settings',
        placeholder: `Make #${room.name} yours`,
        icon: 'hashtag',
      }
    )
  }

  function createRoomModal(channel: Channel, orgId: string) {
    return {
      id: 'create-room',
      icon: 'plus',
      title: 'Create new room',
      placeholder: 'What should we call the new room?',
      commands: () => [],
      search: (_: Command[], query: string) => {
        return query
          ? [
              {
                id: 'create-room',
                name: `Create new room:`,
                suffix: ` #${query}`,
                icon: 'plus',
                callback: () => createRoom(channel, query, orgId),
              },
            ]
          : []
      },
    }
  }

  function createRoom(channel: Channel, name: string, orgId: string) {
    log.info('Creating room', name)

    channel
      .push('rooms:create', {
        name,
        org_id: orgId,
      })
      .receive(
        'ok',
        (response: { room: entities.Room; org_rooms: entities.Room[] }) => {
          dispatch(setOrgRoomIds(response.org_rooms.map((r) => String(r.id))))

          dispatch(
            addBatch(
              response.org_rooms.map((r) => ({
                id: r.id,
                table: entities.Rooms,
                record: toStateEntity(entities.Rooms, r),
              }))
            )
          )

          navigate(`/rooms/${response.room.slug}`)
        }
      )
      .receive('error', (response) => {
        log.info('Can not create room', response)
      })
  }

  function deleteRoomModal(channel: Channel, room: Room) {
    return {
      id: 'delete-room-confirm-' + room.id,
      icon: 'trash',
      title: 'Delete room: ' + room.name,
      commands: () => deleteRoomCmd(channel, room),
      placeholder: 'Want to close #' + room.name + ' room permanently?',
    }
  }

  function deleteRoomCmd(channel: Channel, room: Room) {
    return [
      {
        id: 'delete-room-yes',
        name: `Absolutely, adios "${room.name}"`,
        icon: 'trash',
        keywords: ['yes'],
        callback: () => deleteRoom(channel, room.id),
      },
      {
        id: 'delete-room-no',
        name: `Whooops, change my mind`,
        keywords: ['no'],
        icon: 'undo',
        callback: () => {},
      },
    ]
  }

  function deleteRoom(channel: Channel, id: string) {
    log.info('Deleting room', id)
    channel
      ?.push('rooms:delete', {
        id,
      })
      .receive(
        'ok',
        (response: { room: entities.Room; org_rooms: entities.Room[] }) => {
          dispatch(setOrgRoomIds(response.org_rooms.map((r) => String(r.id))))

          dispatch(
            addBatch(
              response.org_rooms.map((r) => ({
                id: r.id,
                table: entities.Rooms,
                record: toStateEntity(entities.Rooms, r),
              }))
            )
          )
        }
      )
      .receive('error', (response) => {
        log.error('Can not delete room', response)
      })
  }

  function renameRoomModal(channel: Channel, room: Room) {
    return {
      id: 'rename-room',
      icon: 'edit',
      title: 'Rename room: ' + room.name,
      placeholder: 'What should we call this room?',
      commands: () => renameRoomCmd(room),
      search: (all: Command[], query: string) => {
        return query
          ? [
              {
                id: 'create-room',
                name: `Rename ${room?.name} room as:`,
                suffix: `${query}`,
                icon: 'edit',
                callback: () => renameRoom(channel, room.id, query),
              },
            ]
          : all
      },
    }
  }

  function renameRoomCmd(room: Room) {
    return [
      {
        id: 'rename-room',
        name: `Rename "${room.name}" room as:`,
        suffix: `${room.name}`,
        icon: 'edit',
        callback: () => {},
      },
    ]
  }

  function renameRoom(channel: Channel, id: string, name: string) {
    log.info('Renaming room', id, name)
    channel
      ?.push('rooms:rename', {
        id,
        name,
      })
      .receive('ok', (response: { room: entities.Room }) => {
        dispatch(
          add({
            id: response.room.id,
            table: entities.Rooms,
            record: toStateEntity(entities.Rooms, response.room),
          })
        )
      })
      .receive('error', (response) => {
        log.error('Can not delete room', response)
      })
  }
}

const Error = styled('div', {
  center: true,
})

function requestAccess() {
  log.info('request access')
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: 'user',
    },
  })
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

const topBlurEffect =
  'radial-gradient(1000px at 200px -700px, $shellBlur1, transparent)'

const Container = styled('main', {
  width: '100%',
  display: 'grid',
  gridTemplateRows: 'calc(16 * 3.5px) auto calc(28 * 4px)',
  backgroundImage: topBlurEffect,
})

const Header = styled('header', {
  width: '100%',
  display: 'flex',
  space: { inner: [0, 5] },
  borderBottom: '1px solid $shellBorderColor',
})

const TitleBg = styled('div', {
  position: 'absolute',
  top: '13px',
  left: '-8px',
  width: 'calc(100% + 16px)',
  height: 'calc(100% - 4px)',
  round: 'small',
  '&:hover': {
    background: 'rgba(220, 230, 255, 0.04)',
  },
})

const Title = styled('div', {
  display: 'inline-block',
  position: 'relative',
  baselineBlock: 8,
  fontWeight: '$medium',
  label: true,
  color: '$roomTitleFg',
  paddingLeft: '12px',
  //background: 'red',
  [`&:hover ${TitleBg}`]: {
    background: 'rgba(220, 230, 255, 0.1)',
  },
})

const Hash = styled('label', {
  height: '10px',
  marginRight: '1.4px',
  position: 'absolute',
  //background: 'yellow',
  bottom: '3px',
  left: '0',
})

const Label = styled('label', {
  baselineFontSize: 'base',
  label: true,
})
