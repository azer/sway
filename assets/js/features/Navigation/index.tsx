import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import { logger } from 'lib/log'
import { useCommandRegistry } from 'features/CommandRegistry'
import { RoomButton } from './RoomButton'
import { UserButton } from './UserButton'
import { useUserSocket } from 'features/UserSocket'
import { useNavigate } from 'react-router-dom'
import { useRooms } from 'features/Room/use-rooms'
import { RoomNavigationProvider } from 'features/Room/Provider'
import { useInvitePeople } from 'features/Settings/InvitePeople'
import Icon from 'components/Icon'

interface Props {}

const log = logger('navigation')

export function Navigation(props: Props) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { channel } = useUserSocket()

  const inviteModal = useInvitePeople()

  const [workspace, activeRoomIds, focusedRoom, allUsers, prevRoom] =
    useSelector((state) => {
      const workspace = selectors.workspaces.getSelfWorkspace(state)

      return [
        workspace,
        selectors.rooms.listActiveRooms(state),
        selectors.rooms.getFocusedRoom(state),
        workspace
          ? selectors.memberships
              .listByWorkspaceId(state, workspace.id)
              .map((m) => m.user_id)
          : [],
        selectors.rooms.getPrevRoom(state),
      ]
    })

  const { useRegister } = useCommandRegistry()
  const rooms = useRooms()

  useEffect(() => {
    log.info('inactive?', workspace, focusedRoom, prevRoom)
    if (workspace && !focusedRoom?.is_active && prevRoom) {
      log.info('Focused on inactive room. Switch to previous:', prevRoom)
      rooms.enterById(prevRoom.id)
    }
  }, [workspace, focusedRoom?.is_active, !!prevRoom])

  return (
    <Container>
      <Header>
        {workspace?.logoUrl ? (
          <ImageLogo src={workspace?.logoUrl || ''} />
        ) : (
          <TextLogo>
            {workspace?.name ? workspace.name.slice(0, 1) : ''}
          </TextLogo>
        )}
        <OrgName>{workspace?.name}</OrgName>
      </Header>
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
      <Rooms>
        <Title>People</Title>
        {allUsers.map((uid) => (
          <UserButton key={uid} id={uid} />
        ))}
      </Rooms>
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
    </Container>
  )

  function mail() {
    window.location.href = 'mailto:azer@12seeds.io'
  }
}

const Container = styled('nav', {
  position: 'relative',
  borderRight: '1px solid $shellBorderColor',
  width: '220px',
  height: '100%',
  color: '$navigationFg',
  background: `radial-gradient(
      60vh at 0 0,
      $navigationBlur1,
      transparent
    ),
    radial-gradient(
      40vh at calc(100% + 100px) 65%,
      $navigationBlur2,
      transparent
    )`,
})

const Header = styled('header', {
  baselineBlock: 10, // 16,
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '24px auto',
  gridColumnGap: '8px',
  space: { outer: [0, 5] },
  color: '$headerFg',
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
  space: { outer: [9, 5, 0, 5] }, // { outer: [6, 5, 0, 5] },
})

const Title = styled('div', {
  color: '$gray4',
  baselineFontSize: 'small',
  unitHeight: 5,
  fontWeight: '$medium',
  label: true,
})

const Bottom = styled('div', {
  position: 'absolute',
  width: 'calc(100% - 20px)',
  bottom: '20px',
  left: '20px',
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
