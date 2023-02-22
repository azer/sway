import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { globalCss } from '@stitches/react'
import {
  initialState,
  Memberships,
  Room,
  Rooms,
  Status,
  Statuses,
  Users,
} from 'state/entities'
import { ipcRenderer, sendMessage } from 'lib/electron'
import { logger } from 'lib/log'
import { TrayWindowState } from 'features/ElectronTray/selectors'
import { RoomStatus } from 'features/Room/selectors'
import { RoomStatusIcon } from 'components/RoomStatusIcon'
import { useHotkeys } from 'react-hotkeys-hook'
import { Avatar, AvatarRoot } from 'components/Avatar'
//import selectors from 'selectors'
// import { useSelector, useDispatch } from 'state'

const log = logger('electron-tray-window')

interface Props {}

export function ElectronTrayWindow(props: Props) {
  globalStyles()
  const [entities, setEntities] = useState<typeof initialState>(initialState)
  const [localUserId, setLocalUserId] = useState<string | undefined>()
  const [userStatuses, setUserStatuses] = useState<{ [id: string]: string }>({})
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [focusedRoomId, setFocusedRoomId] = useState<string | undefined>()
  const [focusedRoomMode, setFocusedRoomMode] = useState<RoomStatus>(
    RoomStatus.Offline
  )
  const [otherUsers, setOtherUsers] = useState<string[]>([])

  const room = entities[Rooms][focusedRoomId || '']
  const user = entities[Users][localUserId || '']
  const userList = Object.values(entities[Memberships]).map((m) => ({
    id: m.user_id,
    user: entities[Users][m.user_id],
    status: entities[Statuses][userStatuses[m.user_id]],
    isOnline: onlineUsers.includes(m.user_id),
    localTime: new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'America/New_York',
    }),
  }))

  useHotkeys('esc', hideTrayWindow)

  useEffect(() => {
    log.info('Listen tray state')
    ipcRenderer.on('tray-window', onMessage)

    return () => {
      ipcRenderer.removeListener('tray-window', onMessage)
    }

    function onMessage(event: Event, msg: string) {
      const parsed = JSON.parse(msg) as { state: TrayWindowState }
      setEntities(parsed.state.entities)
      setLocalUserId(parsed.state.localUserId)
      setFocusedRoomId(parsed.state.focusedRoomId)
      setOtherUsers(parsed.state.otherUsers)
      setOnlineUsers(parsed.state.onlineUsers)
      setUserStatuses(parsed.state.userStatuses)

      if (parsed.state.focusedRoomMode)
        setFocusedRoomMode(parsed.state.focusedRoomMode)

      log.info('Updated tray window state', parsed, entities, localUserId)
    }
  }, [])

  return (
    <Container>
      <Room onClick={showMainWindow}>
        <RoomStatusIcon mode={focusedRoomMode} />
        <RoomName>{room?.name}</RoomName>
      </Room>
      <UserList>
        {userList.map((u) => (
          <User>
            <Avatar
              src={u.user?.photoUrl || ''}
              fallback={u.user?.name.slice(0)}
              alt={u.user?.name}
            />
            <UserStatusIcon status={userStatus(u.isOnline, u.status)} />
            <UserInfo>
              <Username>{u.user?.name}</Username>
              <Status>
                <LocalTime>{u.localTime}</LocalTime>{' '}
                {userStatusLabel(u.isOnline, u.status)}
              </Status>
            </UserInfo>
          </User>
        ))}
      </UserList>
    </Container>
  )

  function showMainWindow() {
    sendMessage('commands', { command: 'show-main-window' })
  }

  function hideTrayWindow() {
    sendMessage('commands', { command: 'hide-tray-window' })
  }

  function userStatus(
    online: boolean,
    status?: Status
  ): 'offline' | 'active' | 'inactive' {
    if (!online) return 'offline'
    if (status?.mic_on || status?.camera_on) return 'active'
    return 'inactive'
  }

  function userStatusLabel(online: boolean, status?: Status): string {
    if (!online) return 'Offline'

    if (status?.mic_on) {
      return 'Active'
    }

    if (!status) return 'Focus'

    return status.status.slice(0, 1).toUpperCase() + status.status.slice(1)
  }
}

const globalStyles = globalCss({
  html: {
    background: '$electronTrayWindowBg',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
  },
  body: {
    overflow: 'hidden',
    padding: 0,
    margin: 0,
  },
})

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  color: '$electronTrayWindowFg',
  border: '0.5px solid $electronTrayWindowBorder',
})

const Room = styled('header', {
  vcenter: true,
  height: '36px',
  gap: '8px',
  marginTop: '10px',
  padding: '0 15px 10px 15px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.075)',
  [`& ${RoomStatusIcon}`]: {
    marginTop: '4px',
  },
})

const RoomName = styled('label', {
  label: true,
  fontSize: '14px',
})

const Dock = styled('div', {
  position: 'absolute',
  left: '25px',
  bottom: '15px',
  width: 'calc(100% - 50px)',
  height: '44px',
  background: '$dockBg',
  borderRadius: '$large',
})

const UserInfo = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

const Username = styled('div', {
  label: true,
  color: '$electronTrayUsernameFg',
  fontWeight: '$medium',
})

const Status = styled('div', {
  label: true,
  color: '$electronTrayUserStatusFg',
  fontWeight: '$medium',
  fontSize: '12px',
})

const User = styled('div', {
  display: 'flex',
  height: '48px',
  gap: '12px',
  padding: '0 8px',
  vcenter: true,
  position: 'relative',
  [`& ${AvatarRoot}`]: {
    height: '24px',
    borderRadius: '100%',
  },
  '&:hover': {
    background: '$electronTrayHighlightedUserBg',
  },
  [`&:hover ${Username}`]: {
    color: '$electronTrayHighlightedUsernameFg',
  },
  [`&:hover ${Status}`]: {
    color: '$electronTrayHighlightedUserStatusFg',
  },
})

const LocalTime = styled('label', {
  label: true,
  fontSize: '12px',
  fontWeight: '$medium',
  '&::after': {
    marginLeft: '2px',
    content: '·',
  },
})

const UserStatusIcon = styled('div', {
  position: 'absolute',
  left: '26px',
  top: '28px',
  width: '8px',
  aspectRatio: '1',
  border: '1px solid $electronTrayWindowBg',
  round: true,
  variants: {
    status: {
      offline: {
        display: 'none',
      },
      inactive: {
        background: '$yellow',
      },
      active: {
        background: '$green',
      },
    },
  },
})

const UserList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
})

ReactDOM.render(<ElectronTrayWindow />, document.getElementById('root'))
