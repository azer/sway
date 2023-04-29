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
import { logger } from 'lib/log'
import { Empty, StatusSidebar } from './StatusSidebar'
import { usePresence } from 'features/Presence/use-presence'

interface Props {
  roomId: string
}

const log = logger('sidebar/room-sidebar')

export function RoomSidebar(props: Props) {
  const dispatch = useDispatch()
  const presence = usePresence()

  const [room, roomStatus, usersInRoom, updates] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.roomId),
    selectors.rooms.getRoomStatus(state, props.roomId),
    selectors.rooms.getUsersInRoom(state, props.roomId),
    selectors.presence
      .getStatusUpdatesByRoomId(state, props.roomId)
      .map((id: string) => {
        return {
          id,
          status: selectors.statuses.getById(state, id),
          user: selectors.users.getById(
            state,
            selectors.statuses.getById(state, id)?.user_id || ''
          ),
        }
      }),
  ])

  const tileCSS = useMemo(() => {
    if (usersInRoom.length === 0) {
      return {
        gridTemplateColumns: '1fr',
      }
    }

    const size = 73
    const cols = 3
    const rows = Math.max(Math.floor(usersInRoom.length / cols), 1)
    const maxRows = 2
    const maxHeight = Math.min(rows * size, size * maxRows)
    const gap = Math.min(rows, maxRows) * 8

    return {
      gridTemplateColumns: Array.from({ length: cols }, () => size + 'px').join(
        ' '
      ),
      height: Math.max(size, maxHeight + gap),
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
            <RoomParticipant
              key={userId}
              userId={userId}
              tap={presence.tap}
              small
            />
          ))}
          {usersInRoom.length === 0 ? <Empty>Room is empty</Empty> : null}
        </Tile>
        <StatusSidebar roomId={props.roomId} />
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
