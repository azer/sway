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
import { isElectron, messageWindowManager } from 'lib/electron'
import { openUserSidebar } from 'features/Sidebar/slice'
import { GET } from 'lib/api'
import {
  addBatch,
  Room,
  RoomMember,
  RoomMembers,
  Row,
  Update,
} from 'state/entities'
import { addRoomMembers } from 'features/RoomMembers/slice'
import Icon from 'components/Icon'
import { setWorkspaceRoomIds } from 'features/Room/slice'
import { useStatus } from 'features/Status/use-status'

interface Props {}

const log = logger('navigation')
const DEFAULT_HANDBOOK_URL =
  'https://docs.google.com/document/d/1eM2STn3LeTLxTWEzwTeRXH2X6YXGn3U2CcVa1By5go8/edit?usp=sharing'

export function Navigation(props: Props) {
  const dispatch = useDispatch()
  const inviteModal = useInvitePeople()
  const presence = useStatus()

  const [workspace, activeRoomIds, focusedRoom, people, prevRoom, newRelease] =
    useSelector((state) => {
      const workspace = selectors.workspaces.getSelfWorkspace(state)

      return [
        workspace,
        selectors.rooms.listActiveRooms(state),
        selectors.rooms.getFocusedRoom(state),
        selectors.navigation.listPeople(state),
        selectors.rooms.getPrevRoom(state),
        selectors.autoUpdater.getNewRelease(state),
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
            <RoomButton key={id} id={id} />
          ))}
        </Rooms>
        <People>
          <Title>People</Title>
          {people.map((uid) => (
            <UserButton key={uid} id={uid} tap={() => presence.tap(uid)} />
          ))}
        </People>
        <Fill />
        <Bottom>
          {newRelease ? (
            <Button onClick={downloadUpdate} update>
              <ButtonIcon>
                <UpdateIcon />
              </ButtonIcon>
              <ButtonLabel>Install update</ButtonLabel>
            </Button>
          ) : null}
          <Button
            href={workspace?.handbook_url || DEFAULT_HANDBOOK_URL}
            target="_blank"
          >
            <ButtonIcon>
              <Icon name="book" />
            </ButtonIcon>
            <ButtonLabel>User handbook</ButtonLabel>
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

  function downloadUpdate() {
    messageWindowManager({
      quitAndInstallNewRelease: true,
    })
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

export const TrafficLights = styled('div', {
  position: 'relative',
  display: 'flex',
  height: '48px',
  gap: '8px',
  padding: '18px 13px 0 13px',
  '-webkit-app-region': 'drag',
})

export const TrafficLight = styled('div', {
  '-webkit-app-region': 'no-drag',
  position: 'relative',
  'border-radius': '50%',
  width: '12px',
  height: '12px',
  border: '1px solid rgba(255,255,255,.15)',
  variants: {
    fill: {
      true: {
        background: 'rgba(0,0,0,.1)',
      },
    },
  },
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
  fontSize: '13px',
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
  display: 'flex',
  flexDirection: 'column',
  width: 'calc(100% - 20px)',
  marginLeft: '20px',
  marginBottom: '12px',
  gap: '4px',
})

const Button = styled('a', {
  display: 'block',
  textDecoration: 'none',
  width: '100%',
  unitHeight: 8,
  vcenter: true,
  gap: '6px',
  cursor: 'default',
  space: { inner: [2, 3], outer: [0, -3] },
  round: 'small',
  color: '$navigationFg',
  '&:hover': {
    background: '$navigationFocusBg',
    color: '$navigationFocusFg',
  },
  variants: {
    update: {
      true: {
        color: 'rgba(255, 255, 255, 0.75)',
        background: 'rgba(66, 33, 60, 0.45)',
        '&:hover': {
          background: 'rgba(66, 33, 60, 0.65)',
          color: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
  },
})

const ButtonIcon = styled('div', {
  width: '12px',
  marginTop: '2px',
  center: true,
})

const UpdateIcon = styled('div', {
  width: '8px',
  height: '8px',
  round: true,
  background: 'rgb(196, 83, 100, 1)',
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
  height: '100%',
})

const Fill = styled('div', {
  flexGrow: '1',
  minHeight: '20px',
})
