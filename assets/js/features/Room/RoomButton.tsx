import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { useUserSocket } from 'features/UserSocket'
import { Command, useCommandPalette } from 'features/CommandPalette'
import entities, { add, addBatch, Room, Rooms } from '../../state/entities'
import { setWorkspaceRoomIds } from './slice'
import { Channel } from 'phoenix'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useRooms } from './use-rooms'
import { Dropdown } from 'components/DropdownMenu'
import { RoomStatusIcon } from 'components/RoomStatusIcon'

const log = logger('features/rooms/room-button')

interface Props {
  roomId: string
}

export function RoomButton(props: Props) {
  const dispatch = useDispatch()
  const { channel } = useUserSocket()
  const commandPalette = useCommandPalette()
  const { useRegister } = useCommandRegistry()
  const { enterById } = useRooms()

  const [localUser, localWorkspaceId, room, roomStatus] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.workspaces.getSelfWorkspace(state)?.id,
      selectors.rooms.getRoomById(state, props.roomId),
      selectors.rooms.getRoomStatus(state, props.roomId),
    ]
  )

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
          schema: Rooms,
          id: payload.id,
          data: payload,
        })
      )
    })

    channel.on('rooms:create', (payload: { all: Room[]; created: Room }) => {
      log.info('Create message received', payload)

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
            schema: Rooms,
            data: r,
          }))
        )
      )
    })
  }, [channel, localWorkspaceId])

  return (
    <Dropdown.Menu>
      <Dropdown.Trigger>
        <Container onClick={openRoomCommands}>
          <RoomButtonBg />
          <RoomStatusIcon mode={roomStatus} />
          <RoomName>{room?.name}</RoomName>
        </Container>
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Label>Room settings</Dropdown.Label>
        <Dropdown.Item
          icon="edit"
          label={'Rename #' + room?.name}
          onClick={() =>
            channel &&
            commandPalette.open(
              renameRoomCmd(room),
              renameRoomModal(channel, room)
            )
          }
        />
        <Dropdown.Item
          icon="trash"
          label={'Delete #' + room?.name}
          onClick={() =>
            channel &&
            localWorkspaceId &&
            commandPalette.open(
              deleteRoomCmd(channel, room, localWorkspaceId),
              deleteRoomModal(channel, room, localWorkspaceId)
            )
          }
        />
        <Dropdown.Separator />
        <Dropdown.Item
          icon="plus"
          label="Create new room"
          onClick={() =>
            channel &&
            localWorkspaceId &&
            commandPalette.open(
              // @ts-ignore
              () => [],
              createRoomModal(channel, localWorkspaceId)
            )
          }
        />
      </Dropdown.Content>
    </Dropdown.Menu>
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
          id: 'create-new-room',
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
      .receive('ok', (response: { room: Room; workspace_rooms: Room[] }) => {
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
              schema: Rooms,
              data: r,
            }))
          )
        )

        enterById(response.room.id)
      })
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
      .receive('ok', (response: { room: Room; workspace_rooms: Room[] }) => {
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
              schema: Rooms,
              data: r,
            }))
          )
        )
      })
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
                prefix: `Rename "${room?.name}" room as:`,
                name: `${query}`,
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
        prefix: `Rename "${room.name}" room as:`,
        name: `${room.name}`,
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
      .receive('ok', (response: { room: Room }) => {
        dispatch(
          add({
            id: response.room.id,
            schema: Rooms,
            data: response.room,
          })
        )
      })
      .receive('error', (response) => {
        log.error('Can not delete room', response)
      })
  }
}

export const RoomButtonBg = styled('div', {
  position: 'absolute',
  //top: '21px',
  top: '1px',
  left: '-8px',
  width: 'calc(100% + 16px)',
  height: '100%',
  round: 'small',
  '&:hover': {
    background: 'rgba(220, 230, 255, 0.04)',
  },
})

const Container = styled('div', {
  height: '28px',
  display: 'inline-flex',
  vcenter: true,
  position: 'relative',
  fontWeight: '$medium',
  label: true,
  color: '$roomTitleFg',
  [`&:hover ${RoomButtonBg}`]: {
    background: 'rgba(220, 230, 255, 0.1)',
  },
  [`& ${RoomStatusIcon}`]: {
    marginTop: '2.5px',
  },
})

export const RoomName = styled('label', {
  fontSize: '$base',
  label: true,
  marginLeft: '6px',
})
