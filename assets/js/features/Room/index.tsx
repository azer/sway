import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useUserSocket } from 'features/UserSocket'
import { entities, useDispatch, useSelector } from 'state'
import { styled } from 'themes'
import { logger } from 'lib/log'
import { ParticipantGrid } from './ParticipantGrid'

import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { Channel } from 'phoenix'
import { setFocusedRoomById, setWorkspaceRoomIds } from './slice'
import { add, addBatch, Room, Rooms, toStateEntity } from 'state/entities'
import { useCommandRegistry } from 'features/CommandRegistry'
import { Command, useCommandPalette } from 'features/CommandPalette'
import Icon from 'components/Icon'
import { useRooms } from './use-rooms'

// import { useSelector, useDispatch } from 'app/state'

interface Props {
  id: string
}

const log = logger('room')

export function RoomPage(props: Props) {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const { channel } = useUserSocket()
  const { enterById } = useRooms()

  const [localUser, localWorkspaceId, room, isSocketConnected] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.memberships.getSelfMembership(state)?.workspace_id,
      selectors.rooms.getRoomById(state, props.id),
      selectors.rooms.getUsersInRoom(state, props.id),
      selectors.dock.isSwaySocketConnected(state),
    ]
  )

  const commandPalette = useCommandPalette()
  const { useRegister } = useCommandRegistry()

  useRegister(
    (register, registerPaletteCmd) => {
      if (!room || !channel || !localWorkspaceId) return

      registerPaletteCmd(createRoomModal(channel, localWorkspaceId), () => [])
      registerPaletteCmd(renameRoomModal(channel, room), () =>
        renameRoomCmd(room)
      )
      registerPaletteCmd(deleteRoomModal(channel, room, localWorkspaceId), () =>
        deleteRoomCmd(channel, room, localWorkspaceId)
      )
    },
    [channel, room, localWorkspaceId]
  )

  useEffect(() => {
    if (!channel || !localWorkspaceId) return

    channel.on('rooms:update', (payload: Room) => {
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

      dispatch(
        setWorkspaceRoomIds({
          workspaceId: localWorkspaceId,
          roomIds: payload.all.map((r) => String(r.id)),
        })
      )

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
  }, [channel, localWorkspaceId])

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

  function openRoomCommands() {
    if (!channel || !localUser || !localWorkspaceId) return

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
            modal: () => deleteRoomModal(channel, room, localWorkspaceId),
            commands: () => deleteRoomCmd(channel, room, localWorkspaceId),
          },
        },
        {
          id: 'craete-new-room',
          name: 'Create New Room',
          icon: 'plus',
          palette: {
            modal: () => createRoomModal(channel, localWorkspaceId),
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

  function createRoom(channel: Channel, name: string, workspaceId: string) {
    log.info('Creating room', name)

    channel
      .push('rooms:create', {
        name,
        workspace_id: workspaceId,
      })
      .receive(
        'ok',
        (response: {
          room: entities.Room
          workspace_rooms: entities.Room[]
        }) => {
          dispatch(
            setWorkspaceRoomIds({
              workspaceId,
              roomIds: response.workspace_rooms.map((r) => String(r.id)),
            })
          )

          dispatch(
            addBatch(
              response.workspace_rooms.map((r) => ({
                id: r.id,
                table: entities.Rooms,
                record: toStateEntity(entities.Rooms, r),
              }))
            )
          )

          enterById(response.room.id)
        }
      )
      .receive('error', (response) => {
        log.info('Can not create room', response)
      })
  }

  function deleteRoomModal(channel: Channel, room: Room, workspaceId: string) {
    return {
      id: 'delete-room-confirm-' + room.id,
      icon: 'trash',
      title: 'Delete room: ' + room.name,
      commands: () => deleteRoomCmd(channel, room, workspaceId),
      placeholder: 'Want to close #' + room.name + ' room permanently?',
    }
  }

  function deleteRoomCmd(channel: Channel, room: Room, workspaceId: string) {
    return [
      {
        id: 'delete-room-yes',
        name: `Absolutely, adios "${room.name}"`,
        icon: 'trash',
        keywords: ['yes'],
        callback: () => deleteRoom(channel, room.id, workspaceId),
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

  function deleteRoom(channel: Channel, id: string, workspaceId: string) {
    log.info('Deleting room', id)
    channel
      ?.push('rooms:delete', {
        id,
      })
      .receive(
        'ok',
        (response: {
          room: entities.Room
          workspace_rooms: entities.Room[]
        }) => {
          dispatch(
            setWorkspaceRoomIds({
              workspaceId: workspaceId,
              roomIds: response.workspace_rooms.map((r) => String(r.id)),
            })
          )

          dispatch(
            addBatch(
              response.workspace_rooms.map((r) => ({
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
  gridTemplateRows: 'calc(16 * 4px) auto calc(28 * 4px)',
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
  top: '21px',
  left: '-8px',
  width: 'calc(100% + 16px)',
  height: 'calc(100% - 12px)',
  round: 'small',
  '&:hover': {
    background: 'rgba(220, 230, 255, 0.04)',
  },
})

const Title = styled('div', {
  display: 'inline-block',
  position: 'relative',
  baselineBlock: 10,
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
