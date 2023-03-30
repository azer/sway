import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { RoomButton } from './RoomButton'
import { UserButton } from './UserButton'
import { useRooms } from 'features/Room/use-rooms'
import { RoomNavigationProvider } from 'features/Room/Provider'
import { useInvitePeople } from 'features/Settings/InvitePeople'
import { isElectron } from 'lib/electron'
import { useUserSocket } from 'features/UserSocket'
import { openUserSidebar } from 'features/Sidebar/slice'
import { GET } from 'lib/api'
import { RoomMember, Row, scanAPIResponse } from 'state/entities'
import { setRoomMemberUserIdMap } from 'features/RoomMembers/slice'
import Icon from 'components/Icon'

interface Props {}

const log = logger('navigation')

export function Navigation(props: Props) {
  const dispatch = useDispatch()
  const inviteModal = useInvitePeople()
  const socket = useUserSocket()

  const [
    workspace,
    activeRoomIds,
    privateRoomIds,
    focusedRoom,
    allUsers,
    prevRoom,
    localUserId,
    userIdOnSidebar,
    privateRoomToSync,
    isSidebarOpen,
  ] = useSelector((state) => {
    const workspace = selectors.workspaces.getSelfWorkspace(state)
    const privateRoomIds = selectors.rooms.listActivePrivateRooms(state)
    const privateRoomToSync = privateRoomIds.find((id) => {
      if (!selectors.rooms.getRoomById(state, id)) {
        return true
      }

      if (selectors.roomMembers.getMembersByRoomId(state, id).length === 0) {
        return true
      }

      return false
    })

    return [
      workspace,
      selectors.rooms.listActiveRooms(state),
      privateRoomIds,
      selectors.rooms.getFocusedRoom(state),
      workspace
        ? selectors.memberships
            .listByWorkspaceId(state, workspace.id)
            .map((m) => m.user_id)
            .sort(selectors.presence.sortUsersByPresence(state))
        : [],
      selectors.rooms.getPrevRoom(state),
      selectors.session.getUserId(state),
      selectors.sidebar.getFocusedUserId(state),
      privateRoomToSync,
      selectors.sidebar.isOpen(state),
    ]
  })

  const rooms = useRooms()

  useEffect(() => {
    if (workspace && !focusedRoom?.is_active && prevRoom) {
      log.info('Focused on inactive room. Switch to previous:', prevRoom)
      rooms.enterById(prevRoom.id)
    }
  }, [workspace, focusedRoom?.is_active, !!prevRoom])

  useEffect(() => {
    const roomId = privateRoomToSync
    if (!roomId) return

    log.info('Sync up private room data;', roomId)

    GET(`/api/rooms/${roomId}/members`).then((resp) => {
      const userIds = (resp.list as Row<RoomMember>[]).map(
        (m) => m.data.user_id
      )

      dispatch(setRoomMemberUserIdMap({ roomId, userIds }))
      dispatch(scanAPIResponse(resp))
    })
  }, [privateRoomToSync])

  return (
    <Container>
      {isElectron ? (
        <TrafficLights>
          <TrafficLight />
          <TrafficLight />
          <TrafficLight />
        </TrafficLights>
      ) : null}
      <Header electron={isElectron}>
        {workspace?.logoUrl ? (
          <ImageLogo src={workspace?.logoUrl || ''} />
        ) : (
          <TextLogo>
            {workspace?.name ? workspace.name.slice(0, 1) : ''}
          </TextLogo>
        )}
        <OrgName>{workspace?.name}</OrgName>
      </Header>
      <Content>
        <Rooms electron={isElectron}>
          <RoomNavigationProvider />
          <Title>Your Rooms</Title>
          {activeRoomIds.map((id) => (
            <RoomButton
              key={id}
              id={id}
              selected={id === focusedRoom?.id}
              onClick={rooms.enterById}
            />
          ))}
        </Rooms>
        {privateRoomIds.length > 0 ? (
          <Rooms>
            <Title>Private</Title>
            {privateRoomIds.map((id) => (
              <RoomButton
                key={id}
                id={id}
                selected={id === focusedRoom?.id}
                onClick={rooms.enterById}
              />
            ))}
          </Rooms>
        ) : null}
        <People>
          <Title>People</Title>

          {allUsers.map((uid) => (
            <UserButton
              key={uid}
              id={uid}
              onClick={() => dispatch(openUserSidebar(uid))}
              selected={userIdOnSidebar === uid && isSidebarOpen}
            />
          ))}
        </People>
        <Fill />
        <Bottom>
          <Button onClick={inviteModal.open}>
            <ButtonIcon>
              <Icon name="avatar" />
            </ButtonIcon>
            <ButtonLabel>Invite People</ButtonLabel>
          </Button>
          <Button onClick={mail}>
            <ButtonIcon>
              <Icon name="lightbulb" />
            </ButtonIcon>
            <ButtonLabel>Share feedback</ButtonLabel>
          </Button>
        </Bottom>
      </Content>
    </Container>
  )

  function mail() {
    window.location.href = 'mailto:azer@sway.so'
  }
}

export const navigationBlur1 = `radial-gradient(
      60vh at 0 0,
      $navigationBlur1,
      transparent
)`

export const navigationBlur2 = `radial-gradient(
      40vh at calc(100% + 100px) 65%,
      $navigationBlur2,
      transparent
)`

const Container = styled('nav', {
  display: 'grid',
  gridTemplateRows: '60px auto',
  position: 'relative',
  borderRight: '1px solid $shellBorderColor',
  width: '220px',
  height: '100vh',
  color: '$navigationFg',
  background: `${navigationBlur2}`,
})

const Header = styled('header', {
  baselineBlock: 10, // 16,
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '24px auto',
  gridColumnGap: '8px',
  space: { outer: [0, 5] },
  color: '$headerFg',
  variants: {
    electron: {
      true: {
        height: 'auto',
        marginBottom: '32px',
      },
    },
  },
})

const TrafficLights = styled('div', {
  position: 'relative',
  display: 'flex',
  height: '48px',
  gap: '8px',
  padding: '18px 13px 0 13px',
  '-webkit-app-region': 'drag',
})

const TrafficLight = styled('div', {
  '-webkit-app-region': 'no-drag',
  position: 'relative',
  'border-radius': '50%',
  width: '12px',
  height: '12px',
  border: '1px solid rgba(255,255,255,.15)',
})

const ImageLogo = styled('img', {
  width: '24px',
  height: '24px',
  round: 'medium',
  marginBottom: '-6px',
})

const TextLogo = styled('div', {
  background: '$red',
  color: '$white',
  unitWidth: 6,
  unitHeight: 6,
  center: true,
  round: 'medium',
  cursor: 'default',
  fontWeight: '$medium',
  textTransform: 'uppercase',
  baselineFontSize: 'small',
  label: true,
  marginBottom: '-6px',
})

const OrgName = styled('div', {
  baselineFontSize: 'base',
  fontWeight: '$medium',
  label: true,
})

const Rooms = styled('section', {
  space: { outer: [5, 5, 0, 5] }, // { outer: [6, 5, 0, 5] },
})

const Title = styled('div', {
  color: '$gray8',
  baselineFontSize: 'small',
  unitHeight: 5,
  fontWeight: '$medium',
  label: true,
})

const Bottom = styled('div', {
  width: 'calc(100% - 20px)',
  marginLeft: '20px',
  marginBottom: '12px',
})

const Button = styled('div', {
  width: '100%',
  unitHeight: 8,
  vcenter: true,
  gap: '6px',
  cursor: 'default',
  space: { inner: [2, 3], outer: [0, -3] },
  round: 'small',
  '&:hover': {
    background: '$navigationFocusBg',
    color: '$navigationFocusFg',
  },
})

const ButtonIcon = styled('div', {
  width: '10px',
})

const ButtonLabel = styled('div', {
  fontSize: '$small',
  fontWeight: '$medium',
  label: true,
})

const People = styled('div', {
  space: { outer: [9, 5, 0, 5] },
})

const Content = styled('div', {
  position: 'relative',
  overflowY: 'scroll',
  display: 'flex',
  flexDirection: 'column',
})

const Fill = styled('div', {
  flexGrow: '1',
  minHeight: '20px',
})
