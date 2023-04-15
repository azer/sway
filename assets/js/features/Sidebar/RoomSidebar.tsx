import { styled } from 'themes'
import React, { useEffect, useMemo } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { RoomStatusIcon } from 'components/RoomStatusIcon'
import {
  Title,
  SidebarButton,
  SidebarButtonset,
} from 'components/SidebarButton'
import { Icon } from 'components/Icon'
import { RoomParticipant } from 'features/Room/RoomParticipant'
import { GET } from 'lib/api'
import { logger } from 'lib/log'
import { addBatch, Update } from 'state/entities'
import { setRoomStatusUpdates } from 'features/Presence/slice'
import { StatusUpdate, Updates } from './Update'
import { StatusCircle } from 'features/Dock/StatusIcon'

interface Props {
  roomId: string
}

const log = logger('sidebar/room-sidebar')

export function RoomSidebar(props: Props) {
  const dispatch = useDispatch()
  const [room, roomStatus, usersInRoom, updates] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.roomId),
    selectors.rooms.getRoomStatus(state, props.roomId),
    selectors.rooms
      .getUsersInRoom(state, props.roomId)
      .concat(selectors.rooms.getUsersInRoom(state, props.roomId))
      .concat(selectors.rooms.getUsersInRoom(state, props.roomId)),
    selectors.presence.getStatusUpdatesByRoomId(state, props.roomId),
  ])

  useEffect(() => {
    GET(`/api/rooms/${room.id}/updates`)
      .then((response) => {
        if (!response.list) return log.error('Unexpected response', response)

        dispatch(addBatch(response.list.concat(response.links) as Update[]))

        dispatch(
          setRoomStatusUpdates({
            roomId: props.roomId,
            updates: response.list.map((d) => d.id),
          })
        )
      })
      .catch((err) => {
        log.error('Can not fetch updates', err)
      })
  }, [props.roomId])

  const tileCSS = useMemo(() => {
    const size = 73
    const cols = 3
    const rows = Math.floor(usersInRoom.length / cols)
    const maxRows = 2
    const maxHeight = Math.min(rows * size, size * maxRows)
    const gap = Math.min(rows, maxRows) * 8

    return {
      gridTemplateColumns: Array.from({ length: cols }, () => size + 'px').join(
        ' '
      ),
      height: maxHeight + gap,
      minHeight: maxHeight + gap,
    }
  }, [usersInRoom.length])

  return (
    <Container>
      <Header>
        <RoomStatusIcon mode={roomStatus} />
        <RoomName>{room?.name}</RoomName>
      </Header>
      <Content>
        <SidebarButtonset>
          <SidebarButton>
            <Icon name="door-enter" />
            Join
          </SidebarButton>
        </SidebarButtonset>
        <Title>
          People
          {usersInRoom.length ? <label>{usersInRoom.length}</label> : null}
        </Title>
        <Tile css={tileCSS}>
          {usersInRoom.map((userId) => (
            <RoomParticipant userId={userId} tap={() => {}} small />
          ))}
        </Tile>
        <Title>Updates</Title>
        <Updates>
          {updates.map((id) => (
            <StatusUpdate id={id} />
          ))}
        </Updates>
      </Content>
    </Container>
  )
}

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
})

const Header = styled('header', {
  display: 'flex',
  height: '36px',
  gap: '8px',
  vcenter: true,
  margin: '8px 12px 12px 32px',
  [`& ${RoomStatusIcon}`]: {
    marginTop: '2.5px',
  },
})

const RoomName = styled('div', {
  label: true,
})

const Content = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  padding: '0 32px',
  height: 'calc(100vh - 124px)',
})

const Tile = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '8px',
  scrollbar: { y: true },
  '> div': {
    width: '100%',
    aspectRatio: '1',
    [`svg`]: {
      display: 'none',
    },
  },
})
