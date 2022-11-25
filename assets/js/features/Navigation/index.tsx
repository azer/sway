import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'state'
import RoomButton from './RoomButton'

interface Props {}

export default function Navigation(props: Props) {
  // const dispatch = useDispatch()

  const [org, rooms, selectedRoomId] = useSelector((state) => [
    selectors.orgs.getSelfOrg(state),
    selectors.rooms.listAllRooms(state),
    selectors.rooms.getFocusedRoomId(state),
  ])

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
        {rooms.map((id) => (
          <RoomButton key={id} id={id} selected={id === selectedRoomId} />
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
      500px at -200px 10%,
      $navigationBlur1,
      transparent
    ),
    radial-gradient(
      250px at calc(100% + 100px) 65%,
      $navigationBlur2,
      transparent
    )`,
})

const Header = styled('header', {
  baselineBlock: 10,
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
  space: { outer: [9, 5, 0, 5] },
})

const Title = styled('div', {
  color: '$gray4',
  baselineFontSize: 'small',
  unitHeight: 5,
  fontWeight: '$medium',
  label: true,
})
