import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
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
import { init, SearchIndex } from 'emoji-mart'
import Icon from 'components/Icon'
import { Dropdown, StyledDropdownContent } from 'components/DropdownMenu'
import { titleCase, firstName } from 'lib/string'
import { ToggleGroup } from 'components/ToggleGroup'
import { commonEmojis, EmojiObject } from './selectors'
import { PresenceStatus, PresenceModes } from 'state/presence'

//import selectors from 'selectors'
// import { useSelector, useDispatch } from 'state'

const log = logger('electron-tray-window')

const fakeState = `{
    "state": {
        "entities": {
            "users": {
                "9": {
                    "id": "9",
                    "email": "azer@roadbeats.com",
                    "name": "Azer Koculu",
                    "photoUrl": "https://lh3.googleusercontent.com/a/AEdFTp4Kha4u3O8XfD0xjN8mU8RIZobSpzrUtB3x-ejcww=s96-c"
                },
                "10": {
                    "id": "10",
                    "email": "herzamanharman@gmail.com",
                    "name": "Nova Togatorop",
                    "photoUrl": "https://lh3.googleusercontent.com/a/AEdFTp42NzIXu4OxA0R4hzGvGbAT2rn5UW3XyBReRFbZ=s96-c"
                }
            },
            "memberships": {
                "3": {
                    "id": "3",
                    "inserted_at": "2023-01-29T13:57:22",
                    "is_admin": true,
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "4": {
                    "id": "4",
                    "inserted_at": "2023-01-31T08:26:58",
                    "is_admin": false,
                    "user_id": "10",
                    "workspace_id": "3"
                }
            },
            "workspaces": {
                "3": {
                    "domain": "testing",
                    "id": "3",
                    "is_active": true,
                    "logo_url": "https://cldup.com/H5Y6L9jt3v.png",
                    "name": "Team Sway",
                    "slug": "testing"
                }
            },
            "rooms": {
                "69": {
                    "id": "69",
                    "inserted_at": "2023-01-30T12:45:11",
                    "is_active": false,
                    "is_default": true,
                    "name": "watercooler",
                    "slug": "watercooler",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "70": {
                    "id": "70",
                    "inserted_at": "2023-01-30T22:23:15",
                    "is_active": true,
                    "is_default": false,
                    "name": "tech",
                    "slug": "tech",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "71": {
                    "id": "71",
                    "inserted_at": "2023-01-30T22:24:57",
                    "is_active": true,
                    "is_default": false,
                    "name": "design",
                    "slug": "design",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "72": {
                    "id": "72",
                    "inserted_at": "2023-01-30T22:26:22",
                    "is_active": false,
                    "is_default": false,
                    "name": "hey",
                    "slug": "hey",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "73": {
                    "id": "73",
                    "inserted_at": "2023-01-31T14:34:05",
                    "is_active": true,
                    "is_default": false,
                    "name": "watercooler",
                    "slug": "spiral",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "74": {
                    "id": "74",
                    "inserted_at": "2023-01-31T16:24:49",
                    "is_active": false,
                    "is_default": false,
                    "name": "ben",
                    "slug": "ben",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "75": {
                    "id": "75",
                    "inserted_at": "2023-01-31T16:25:31",
                    "is_active": false,
                    "is_default": false,
                    "name": "yolo",
                    "slug": "yolo",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "76": {
                    "id": "76",
                    "inserted_at": "2023-01-31T16:28:04",
                    "is_active": false,
                    "is_default": false,
                    "name": "sade",
                    "slug": "sade",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "77": {
                    "id": "77",
                    "inserted_at": "2023-01-31T16:38:37",
                    "is_active": false,
                    "is_default": false,
                    "name": "afrrica",
                    "slug": "afrrica",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "78": {
                    "id": "78",
                    "inserted_at": "2023-01-31T17:46:41",
                    "is_active": false,
                    "is_default": false,
                    "name": "bir",
                    "slug": "bir",
                    "user_id": "10",
                    "workspace_id": "3"
                },
                "79": {
                    "id": "79",
                    "inserted_at": "2023-02-08T12:48:57",
                    "is_active": true,
                    "is_default": false,
                    "name": "pomodoro",
                    "slug": "pomodoro",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "80": {
                    "id": "80",
                    "inserted_at": "2023-02-08T12:49:20",
                    "is_active": true,
                    "is_default": false,
                    "name": "pair-programming",
                    "slug": "pair-programming",
                    "user_id": "9",
                    "workspace_id": "3"
                },
                "81": {
                    "id": "81",
                    "inserted_at": "2023-02-08T12:49:26",
                    "is_active": true,
                    "is_default": false,
                    "name": "office-hours",
                    "slug": "office-hours",
                    "user_id": "9",
                    "workspace_id": "3"
                }
            },
            "statuses": {
                "318": {
                    "camera_on": false,
                    "id": "318",
                    "inserted_at": "2023-02-14T12:14:55",
                    "message": null,
                    "mic_on": false,
                    "room_id": "71",
                    "speaker_on": true,
                    "status": "zen",
                    "user_id": "9",
                    "workspace_id": "3"
                }
            },
            "daily_participants": {}
        },
        "localUserId": "9",
        "focusedRoomId": "71",
        "focusedRoomMode": "focus",
        "otherUsers": [],
        "userStatuses": {
            "9": "318"
        },
        "onlineUsers": [
            "9"
        ],
        "usersByRooms": {
            "71": [
                "9"
            ]
        }
    }
}`

interface Props { }

export function ElectronTrayWindow(props: Props) {
  globalStyles()

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [emojiQuery, setEmojiQuery] = useState('')
  const [emojiResults, setEmojiResults] = useState<EmojiObject[]>(commonEmojis)
  const [entities, setEntities] = useState<typeof initialState>(initialState)
  const [localUserId, setLocalUserId] = useState<string | undefined>()
  const [userStatuses, setUserStatuses] = useState<{ [id: string]: string }>({})
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [focusedRoomId, setFocusedRoomId] = useState<string | undefined>()
  const [focusedRoomMode, setFocusedRoomMode] = useState<RoomStatus>(
    RoomStatus.Offline
  )
  const [otherUsers, setOtherUsers] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedEmojiIndex, setSelectedEmojiIndex] = useState(-1)
  const [isFocusOnEmoji, setIsFocusOnEmoji] = useState(false)
  const [isFocusOnMessageInput, setIsFocusOnMessageInput] = useState(false)

  const room = entities[Rooms][focusedRoomId || '']
  const localUser = entities[Users][localUserId || '']
  const localPresence = localUserId
    ? entities[Statuses][userStatuses[localUserId]]
    : undefined
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

  useHotkeys('esc', hideTrayWindow, { enabled: !isDropdownOpen }, [
    isDropdownOpen,
  ])

  useHotkeys(
    'left, up',
    () => setSelectedEmojiIndex(Math.max(0, selectedEmojiIndex - 1)),
    { enabled: isFocusOnEmoji, enableOnFormTags: true, preventDefault: true },
    [isFocusOnEmoji, selectedEmojiIndex]
  )

  useHotkeys(
    'right, down',
    () => setSelectedEmojiIndex((selectedEmojiIndex + 1) % 10),
    { enabled: isFocusOnEmoji, enableOnFormTags: true, preventDefault: true },
    [isFocusOnEmoji, selectedEmojiIndex]
  )

  useHotkeys(
    'enter',
    handleEmojiSelect,
    { enabled: isFocusOnEmoji, enableOnFormTags: true },
    [isFocusOnEmoji, selectedEmojiIndex]
  )

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [!!inputRef.current])

  useEffect(() => {
    log.info('Updating emoji search results', emojiQuery)
    if (emojiQuery.trim().length === 0) {
      setEmojiResults(commonEmojis)
      return
    }
    // @ts-ignore
    SearchIndex.search(emojiQuery, { maxResults: 25 })
      .then((results) => {
        log.info('Update emoji results', results)
        setEmojiResults(results || [])
        setSelectedEmojiIndex(results.length ? 0 : -1)
      })
      .catch((err) => {
        log.error('Something went wrong with emoji search', err)
      })
  }, [emojiQuery])

  useEffect(() => {
    log.info('Listen tray state')
    ipcRenderer?.on('tray-window', onMessage)

    // @ts-ignore
    onMessage(null, fakeState)

    log.info('Fetching emoji data')
    fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data')
      .then(async (resp) => {
        init({ data: await resp.json() })
      })
      .catch((err) => log.error("can't load emojis", err))

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

      <Dock open={isDropdownOpen}>
        <Dropdown.Menu onOpenChange={handleDropdownState}>
          <Dropdown.Trigger>
            <StatusButton>
              <Icon name="emoji" />
            </StatusButton>
          </Dropdown.Trigger>
          <MessageInput
            type="text"
            ref={inputRef}
            placeholder={`What's cookin, ${firstName(localUser?.name || '')}?`}
            onFocus={() => setIsFocusOnMessageInput(true)}
            onBlur={() => setIsFocusOnMessageInput(false)}
          />

          <StatusDropdown>
            <Dropdown.Label>Set your flow</Dropdown.Label>
            <ToggleGroup.Root value={PresenceStatus.Online}>
              {PresenceModes.map((m) => (
                <ToggleGroup.Item
                  data-mode={m.status}
                  value={m.status}
                  key={m.status}
                >
                  <ModeIcon mode={m.status} />
                  <ToggleGroup.Label>{titleCase(m.status)}</ToggleGroup.Label>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
            <Separator />
            <SearchField>
              <Icon name="search" />
              <EmojiSearchInput
                value={emojiQuery}
                onChange={handleEmojiQuery}
                placeholder="Emoji search"
                onFocus={() => setIsFocusOnEmoji(true)}
                onBlur={() => setIsFocusOnEmoji(false)}
              />
            </SearchField>
            <EmojiPicker>
              {emojiResults.length === 0 ? (
                <NoEmoji>No emojis found</NoEmoji>
              ) : (
                emojiResults.slice(0, 10).map((e, ind) => (
                  <Emoji
                    role="img"
                    aria-label={e.id}
                    highlighted={ind === selectedEmojiIndex}
                  >
                    {e.skins[0].native}
                  </Emoji>
                ))
              )}
            </EmojiPicker>
          </StatusDropdown>
        </Dropdown.Menu>
      </Dock>
    </Container >
  )

  function showMainWindow() {
    sendMessage('commands', { command: 'show-main-window' })
  }

  function hideTrayWindow() {
    sendMessage('commands', { command: 'hide-tray-window' })
  }

  function handleEmojiQuery(e: Event) {
    setEmojiQuery(e.currentTarget.value)
  }

  function handleEmojiSelect() {
    log.info('selected emoji', emojiResults[selectedEmojiIndex])
  }

  function handleDropdownState(open: boolean) {
    setIsDropdownOpen(open)
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
  padding: '0 15px',
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
  left: '31px',
  top: '26px',
  width: '12px',
  aspectRatio: '1',
  border: '2px solid $gray1',
  round: true,
  variants: {
    status: {
      offline: {
        background: '$gray1',
        border: '2px solid transparent',
        '&::after': {
          content: ' ',
          width: '5px',
          borderRadius: '100%',
          aspectRatio: '1',
          border: '1.5px solid rgba(255, 255, 255, 0.3)',
          position: 'absolute',
          top: '0px',
          left: '0px',
        },
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

const Dock = styled('div', {
  position: 'absolute',
  left: '15px',
  bottom: '15px',
  width: 'calc(100% - 30px)',
  height: '44px',
  padding: '0 12px',
  vcenter: true,
  background: '$electronTrayDockBg',
  borderRadius: '$medium',
  border: '1px solid transparent',
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  '&:focus-within': {
    borderTop: '0',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: 'rgb(0 0 0 / 10%) 0px 3px 8px',
    background: '$electronTrayDockOpenBg',
  },
  variants: {
    open: {
      true: {
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'rgb(0 0 0 / 10%) 0px 3px 8px',
        background: '$electronTrayDockOpenBg',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderTop: '0',
      },
    },
  },
})

const StatusDropdown = styled(StyledDropdownContent, {
  width: 'calc(100vw - 30px)',
  marginLeft: '15px',
  marginBottom: '8px',
  background: '$electronTrayDropdownOpenBg',
  border: '1px solid rgba(255,255,255,0.05)',
  borderBottom: '0',
  borderRadius: '0',
  borderTopLeftRadius: '$medium',
  borderTopRightRadius: '$medium',
  backdropFilter: 'none',
  boxShadow: 'rgb(0 0 0 / 10%) 0px -10px 8px',
  [`& ${ToggleGroup.StyledRoot}`]: {
    width: '100%',
    margin: '2px 0 8px 0',
    fontFamily: '$sans',
    fontSize: '$base',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [`& ${ToggleGroup.StyledItem}`]: {
    fontFamily: '$sans',
    fontSize: '$base',
    center: true,
    flexDirection: 'row',
  },
  [`& ${Dropdown.Label}`]: {
    paddingLeft: '6px',
    fontSize: '$base',
    color: 'rgba(255, 255, 255, 0.5)',
  },
})

const StatusButton = styled('div', {
  width: '20px',
  height: '20px',
  color: 'rgba(255, 255, 255, 0.4)',
})

const EmojiPicker = styled('div', {
  display: 'flex',
  vcenter: true,
  height: '28px',
  overflow: 'hidden',
  margin: '12px 2px 6px 2px',
})

const Emoji = styled('span', {
  display: 'inline-flex',
  aspectRatio: '1',
  height: '100%',
  center: true,
  fontSize: '21px',
  borderRadius: '$medium',
  label: true,
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  variants: {
    highlighted: {
      true: {
        background: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
})

const NoEmoji = styled('div', {
  textAlign: 'center',
  paddingLeft: '8px',
  color: '$gray9',
})

const MessageInput = styled('input', {
  display: 'block',
  border: 0,
  width: '100%',
  height: '100%',
  background: 'transparent',
  outline: 'none',
  font: '$sans',
  fontSize: '$base',
  color: '$electronTrayTextFieldFg',
  fontWeight: '$medium',
  caretColor: '$electronTrayTextFieldCaret',
  '&::selection': {
    background: '$electronTrayTextFieldSelectionBg',
  },
  '&::placeholder': {
    color: '$electronTrayTextFieldPlaceholder',
  },
})

const ModeIcon = styled('div', {
  width: '8px',
  aspectRatio: '1',
  round: true,
  background: '$green',
  marginTop: '2px',
  variants: {
    mode: {
      [PresenceStatus.Online]: {
        background: '$green',
      },
      [PresenceStatus.Focus]: {
        background: '$yellow',
      },
      [PresenceStatus.Zen]: {
        background: '$red',
      },
    },
  },
})

const SearchField = styled('div', {
  position: 'relative',
  height: '32px',
  vcenter: true,
  background: 'rgba(115, 120, 125, 0.2)',
  borderRadius: '$medium',
  [`& svg`]: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    left: '8px',
  },
})

const LocalPresenceMode = styled('div', {
  height: '24px',
  '& div': {
    height: '100%',
  },
})

const Separator = styled('div', {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.05)',
  width: 'calc(100% + 12px)',
  margin: '4px 0 8px -6px',
})

const EmojiSearchInput = styled('input', {
  display: 'block',
  width: '100%',
  border: '0',
  background: 'transparent',
  height: '100%',
  padding: '0 0 0 28px',
  color: '$electronTrayTextFieldFg',
  fontWeight: '$medium',
  caretColor: '$electronTrayTextFieldCaret',
  outline: 'none',
  fontSize: '$base',
  fontFamily: '$sans',
  '&::selection': {
    background: '$electronTrayTextFieldSelectionBg',
  },
  '&::placeholder': {
    color: '$electronTrayTextFieldPlaceholder',
  },
})

ReactDOM.render(<ElectronTrayWindow />, document.getElementById('root'))
