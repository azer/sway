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
import { openUserSidebar } from 'features/Sidebar/slice'
import { GET } from 'lib/api'
import {
  addBatch,
  Room,
  RoomMember,
  RoomMembers,
  Row,
  scanAPIResponse,
  Update,
} from 'state/entities'
import {
  addRoomMembers,
  setRoomMemberUserIdMap,
} from 'features/RoomMembers/slice'
import Icon from 'components/Icon'
import { setWorkspaceRoomIds } from 'features/Room/slice'

interface Props {}

const log = logger('navigation')

export function Navigation(props: Props) {
  const dispatch = useDispatch()
  const inviteModal = useInvitePeople()

  const [
    workspace,
    activeRoomIds,
    privateRoomIds,
    focusedRoom,
    people,
    prevRoom,
    userIdOnSidebar,
    isSidebarOpen,
  ] = useSelector((state) => {
    const workspace = selectors.workspaces.getSelfWorkspace(state)
    const privateRoomIds = selectors.rooms.listActivePrivateRooms(state)

    return [
      workspace,
      selectors.rooms.listActiveRooms(state),
      privateRoomIds,
      selectors.rooms.getFocusedRoom(state),
      selectors.navigation.listPeople(state),
      selectors.rooms.getPrevRoom(state),
      selectors.sidebar.getFocusedUserId(state),
      selectors.sidebar.isOpen(state),
    ]
  })

  useEffect(() => {
    if (!workspace?.id) return

    log.info('Fetching private rooms', workspace?.id)

    GET(`/api/rooms/?workspace_id[eq]=${workspace.id}&is_private[true]`)
      .then((response) => {
        dispatch(
          addBatch(
            (response.links as Update[]).concat(response.list as Row<Room>[])
          )
        )

        dispatch(
          setWorkspaceRoomIds({
            roomIds: (response.list as Row<Room>[]).map((r) => r.id),
            workspaceId: workspace.id,
            privateRoom: true,
          })
        )

        const roomMembers = response.links.filter(
          (l) => l.schema === RoomMembers
        )

        dispatch(addRoomMembers(roomMembers as Row<RoomMember>[]))
      })
      .catch((err) => {
        log.error('Failed to fetch private rooms', err)
      })
  }, [!workspace?.id])

  const rooms = useRooms()

  useEffect(() => {
    if (workspace && !focusedRoom?.is_active && prevRoom) {
      log.info('Focused on inactive room. Switch to previous:', prevRoom)
      rooms.enterById(prevRoom.id)
    }
  }, [workspace, focusedRoom?.is_active, !!prevRoom])

  return (
    <Container electron={isElectron}>
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
        <Rooms>
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

          {people.map((uid) => (
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
  display: 'flex',
  flexDirection: 'column',
  //gridTemplateRows: '48px auto',
  position: 'relative',
  borderRight: '1px solid $shellBorderColor',
  width: '220px',
  height: '100vh',
  color: '$navigationFg',
  background: `${navigationBlur2}`,
  variants: {
    electron: {
      true: {
        //gridTemplateRows: '48px 26px auto',
      },
    },
  },
})

const Header = styled('header', {
  vcenter: true,
  height: '48px',
  minHeight: '48px',
  display: 'grid',
  gridTemplateColumns: '24px auto',
  gridColumnGap: '0px',
  space: { outer: [0, 5] },
  color: '$headerFg',
  variants: {
    electron: {
      true: {
        height: '26px',
        minHeight: '26px',
        marginBottom: '8px',
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
  width: '20px',
  height: '20px',
  round: 'medium',
})

const TextLogo = styled('div', {
  background: '$red',
  color: '$white',
  width: '18px',
  height: '18px',
  center: true,
  round: 'small',
  cursor: 'default',
  fontWeight: '$medium',
  textTransform: 'uppercase',
  fontSize: '10px',
  label: true,
})

const OrgName = styled('div', {
  fontSize: '$small',
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
  display: 'flex',
  flexDirection: 'column',
  scrollbar: { y: true, dark: true },
})

const Fill = styled('div', {
  flexGrow: '1',
  minHeight: '20px',
})
