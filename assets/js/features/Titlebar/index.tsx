import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { Avatar } from 'components/Avatar'
import { useSelector } from 'state'
import { topBlurEffect } from 'features/Room'
import { RoomButton, RoomName, RoomButtonBg } from 'features/Room/RoomButton'
import { Tooltip } from 'components/Tooltip'

interface Props {}

export function Titlebar(props: Props) {
  // const dispatch = useDispatch()
  const [workspace, room] = useSelector((state) => [
    selectors.workspaces.getSelfWorkspace(state),
    selectors.rooms.getFocusedRoom(state),
  ])

  return (
    <Container>
      <TrafficLights>
        <TrafficLight />
        <TrafficLight />
        <TrafficLight />
      </TrafficLights>
      <Left>
        <Workspace>
          <Avatar
            src={workspace?.logoUrl || ''}
            fallback={workspace?.name[0] || ''}
          />
          <Tooltip content="Your workspace">
            <WorkspaceName>{workspace?.name}</WorkspaceName>
          </Tooltip>
        </Workspace>
      </Left>
      <Right>
        <Room>
          <RoomButton roomId={room?.id || ''} />
        </Room>
      </Right>
    </Container>
  )
}

const Container = styled('div', {
  width: '100%',
  height: '48px',
  borderBottom: '1px solid $shellBorderColor',
  display: 'grid',
  gridTemplateColumns: '100px auto',
  vcenter: true,
  '-webkit-app-region': 'drag',
})

const TrafficLights = styled('div', {
  display: 'flex',
  height: '100%',
  gap: '8px',
  padding: '14px 13px 0 13px',
  borderRight: '1px solid $shellBorderColor',
})

const TrafficLight = styled('div', {
  '-webkit-app-region': 'no-drag',
  position: 'relative',
  'border-radius': '50%',
  width: '12px',
  height: '12px',
  border: '1px solid rgba(255,255,255,.15)',
})

const Left = styled('div', {
  display: 'flex',
  height: '100%',
})

const Workspace = styled('div', {
  borderRight: '1px solid $shellBorderColor',
  width: '141px',
  padding: '0 12px',
  height: '100%',
  display: 'flex',
  vcenter: true,
  gap: '8px',
  '-webkit-app-region': 'no-drag',
})

const WorkspaceName = styled('div', {
  label: true,
  color: '$white',
  fontSize: '13px',
  fontWeight: '500',
  ellipsis: true,
})

const Right = styled('div', {
  display: 'flex',
  width: 'auto',
  height: '100%',
  padding: '0 12px',
})

const Room = styled('div', {
  vcenter: true,
  '-webkit-app-region': 'no-drag',
  [`& ${RoomName}`]: {
    fontSize: '13px',
  },
  [`& ${RoomButtonBg}`]: {
    width: 'calc(100% + 12px)',
    height: 'calc(100% - 2px)',
    left: '-7px',
    top: '2px',
  },
})
