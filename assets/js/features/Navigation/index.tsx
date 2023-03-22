import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { logger } from 'lib/log'
import { RoomButton } from './RoomButton'
import { UserButton } from './UserButton'
import { useRooms } from 'features/Room/use-rooms'
import { RoomNavigationProvider } from 'features/Room/Provider'
import { useInvitePeople } from 'features/Settings/InvitePeople'
import { isElectron } from 'lib/electron'
import { useUserSocket } from 'features/UserSocket'

interface Props {}

const log = logger('navigation')

export function Navigation(props: Props) {
  const inviteModal = useInvitePeople()
  const socket = useUserSocket()

  const [
    workspace,
    activeRoomIds,
    focusedRoom,
    allUsers,
    prevRoom,
    localUserId,
  ] = useSelector((state) => {
    const workspace = selectors.workspaces.getSelfWorkspace(state)

    return [
      workspace,
      selectors.rooms.listActiveRooms(state),
      selectors.rooms.getFocusedRoom(state),
      workspace
        ? selectors.memberships
            .listByWorkspaceId(state, workspace.id)
            .map((m) => m.user_id)
            .sort(selectors.presence.sortUsersByPresence(state))
        : [],
      selectors.rooms.getPrevRoom(state),
      selectors.session.getUserId(state),
    ]
  })

  const rooms = useRooms()

  useEffect(() => {
    if (workspace && !focusedRoom?.is_active && prevRoom) {
      log.info('Focused on inactive room. Switch to previous:', prevRoom)
      rooms.enterById(prevRoom.id)
    }
  }, [workspace, focusedRoom?.is_active, !!prevRoom])

  return (
    <Container electron={isElectron}>
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
      <Rooms electron={isElectron}>
        <Title>People</Title>
        {allUsers.map((uid) => (
          <UserButton
            key={uid}
            id={uid}
            onClick={() =>
              localUserId &&
              createPrivateRoom(localUserId, workspace?.id || '', [
                localUserId,
                uid,
              ])
            }
          />
        ))}
      </Rooms>
    </Container>
  )

  /*<Bottom>
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
      </Bottom>*/

  function mail() {
    window.location.href = 'mailto:azer@sway.so'
  }

  function createPrivateRoom(
    localUserId: string,
    workspaceId: string,
    users: string[]
  ) {
    socket.channel
      ?.push('rooms:create_private', {
        workspace_id: workspaceId,
        created_by: localUserId,
        users: users,
      })
      .receive('ok', (response) => {
        log.info('created private room', response)
      })
      .receive('error', (error) => {
        log.error('can not create private room', error)
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
  position: 'relative',
  borderRight: '1px solid $shellBorderColor',
  width: '220px',
  color: '$navigationFg',
  background: `${navigationBlur1}, ${navigationBlur2}`,
  variants: {
    electron: {
      true: {
        background: `${navigationBlur2}`,
      },
    },
  },
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
        display: 'none',
      },
    },
  },
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
  variants: {
    electron: {
      true: {
        marginTop: '28px',
      },
    },
  },
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
