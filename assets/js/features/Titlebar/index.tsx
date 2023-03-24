import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { RoomButton, RoomName, RoomButtonBg } from 'features/Room/RoomButton'
import { Tooltip } from 'components/Tooltip'
import { SidebarHeader } from 'features/Sidebar/Header'
import { isElectron } from 'lib/electron'

interface Props {}

export function Titlebar(props: Props) {
  // const dispatch = useDispatch()
  const [workspace, room, sidebarOpen] = useSelector((state) => [
    selectors.workspaces.getSelfWorkspace(state),
    selectors.rooms.getFocusedRoom(state),
    selectors.sidebar.isOpen(state),
  ])

  return (
    <Container>
      <Right>
        <Room>
          <RoomButton roomId={room?.id || ''} />
        </Room>
      </Right>
      <SidebarHeader />
    </Container>
  )
}

const Container = styled('div', {
  width: '100%',
  height: '48px',
  display: 'grid',
  gridTemplateColumns: '100px auto',
  vcenter: true,
  '-webkit-app-region': 'drag',
})

const Separator = styled('div', {
  position: 'absolute',
  right: '0',
  height: '100%',
  width: '1px',
  background: '$shellBorderColor',
})

const Workspace = styled('div', {
  width: '142px',
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
  flex: 1,
  height: '100%',
  padding: '0 12px',
  borderBottom: '1px solid $shellBorderColor',
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
