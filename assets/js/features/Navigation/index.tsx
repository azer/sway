import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import logger from 'lib/log'
import { useCommandRegistry } from 'features/CommandRegistry'
import { RoomButton } from './RoomButton'
import { UserButton } from './UserButton'
import { useUserSocket } from 'features/UserSocket'
import { useNavigate } from 'react-router-dom'

interface Props {}

const log = logger('navigation')

export function Navigation(props: Props) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { channel } = useUserSocket()

  const [org, activeRoomIds, focusedRoom, allUsers, localUser, prevRoom] =
    useSelector((state) => [
      selectors.orgs.getSelfOrg(state),
      selectors.rooms.listActiveRooms(state),
      selectors.rooms.getFocusedRoom(state),
      selectors.orgs.getUsersByOrgId(state),
      selectors.users.getSelf(state),
      selectors.rooms.getPrevRoom(state),
    ])

  const { useRegister } = useCommandRegistry()

  useEffect(() => {
    if (!focusedRoom?.isActive && prevRoom) {
      navigate(`/rooms/${prevRoom.slug}`)
    }
  }, [focusedRoom?.isActive, !!prevRoom])

  return (
    <Container>
      <Header>
        {org?.logoUrl ? (
          <ImageLogo src={org?.logoUrl || ''} />
        ) : (
          <TextLogo>{org?.name ? org.name.slice(0, 1) : ''}</TextLogo>
        )}
        <OrgName>{org?.name}</OrgName>
      </Header>
      <Rooms>
        <Title>Your Rooms</Title>
        {activeRoomIds.map((id) => (
          <RoomButton key={id} id={id} selected={id === focusedRoom?.id} />
        ))}
      </Rooms>
      <Rooms>
        <Title>People</Title>
        {allUsers.map((u) => (
          <UserButton key={u.id} id={u.id} />
        ))}
      </Rooms>
    </Container>
  )
}

const Container = styled('nav', {
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
  baselineBlock: 16, // 10,
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
  space: { outer: [6, 5, 0, 5] }, // { outer: [9, 5, 0, 5] },
})

const Title = styled('div', {
  color: '$gray4',
  baselineFontSize: 'small',
  unitHeight: 5,
  fontWeight: '$medium',
  label: true,
})
