import { styled } from 'themes'
import ReactDOM from 'react-dom'
import React, { useEffect, useRef, useState } from 'react'
import { logger } from 'lib/log'
import { globalCss } from '@stitches/react'
import {
  ElectronMessage,
  getIpcRenderer,
  messageMainWindow,
  messageWindowManager,
} from 'lib/electron'
import { TrayWindowState } from 'features/ElectronTray'
import { ElectronWindow } from 'lib/electron'
import { RoomStatusIcon } from 'components/RoomStatusIcon'
import { useHotkeys } from 'react-hotkeys-hook'
import { EmojiProvider } from 'features/Emoji/Provider'
import { useEmojiSearch } from 'features/Emoji/use-emoji-search'
import { commonEmojis } from './selectors'
import { DockFocus, DockFocusRegion } from 'features/Dock/focus'
import {
  MessageSection,
  StatusControls,
  StatusControlsRoot,
} from 'features/Dock/StatusControls'
import * as Tooltip from '@radix-ui/react-tooltip'
import { TrayCallControls } from './TrayCallControls'
import { Button } from 'features/Dock/Button'
import { UserIconView } from 'components/UserView'
import { UserListView } from 'components/UserView/UserListView'
import { PresenceStatus } from 'state/presence'
// import { useSelector, useDispatch } from 'state'

const log = logger('electron-tray-window')

interface Props {}

export function ElectronTrayWindow(props: Props) {
  const dockEl = useRef<HTMLDivElement>(null)
  const containerEl = useRef<HTMLDivElement>(null)

  const [trayState, setTrayState] = useState<TrayWindowState>({})
  const [dockFocus, setDockFocus] = useState<DockFocus>()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    trayState.localStatus?.message || ''
  )

  const [videoFrame, setVideoFrame] = useState<
    Record<string, { ts: number; frame: string }>
  >({})

  const emojiSearch = useEmojiSearch()

  useEffect(() => {
    messageMainWindow({ trayWindowCreated: true })
  }, [])

  useEffect(() => {
    log.info('Listen messages')

    getIpcRenderer()?.on('message', onMessage)
    messageMainWindow({ requestState: true })

    return () => {
      getIpcRenderer()?.removeListener('message', onMessage)
    }
  }, [])

  useEffect(() => {
    if (trayState.localStatus && statusMessage === '') {
      setStatusMessage(trayState.localStatus.message)
    }
  }, [!trayState.localStatus])

  useEffect(() => {
    if (
      trayState.localStatus?.message &&
      trayState.localStatus?.message !== statusMessage
    ) {
      log.info(
        'Local status message changed:',
        trayState.localStatus?.message,
        statusMessage
      )
      setStatusMessage(trayState.localStatus?.message)
    }
  }, [trayState.localStatus?.id])

  useHotkeys('esc', hideTrayWindow)

  useHotkeys(
    'up',
    moveFocus(-1),
    {
      enabled: !!dockFocus,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [dockFocus]
  )

  useHotkeys(
    'down',
    moveFocus(1),
    {
      enabled: !!dockFocus,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [dockFocus]
  )

  globalStyles()

  const active =
    trayState.participants?.filter((p) => !p.isSelf && p.isActive) || []
  const inactive =
    trayState.participants?.filter((p) => !p.isSelf && !p.isActive) || []

  return (
    <Tooltip.Provider>
      <EmojiProvider />
      <Container onClick={handleClick} ref={containerEl}>
        <RoomHeader onClick={showMainWindow}>
          <RoomStatusIcon mode={trayState.focusedRoomStatus} />
          <RoomName>{trayState.focusedRoom?.name}</RoomName>
        </RoomHeader>
        {active.length === 0 && inactive.length === 0 ? (
          <Empty onClick={showMainWindow}>
            It{"'"}s just you at the moment.
            <br /> Check out other rooms?
          </Empty>
        ) : null}
        {active.length ? (
          <>
            <Title>
              <label>
                Call {active.length > 1 ? `(${active.length})` : ''}
              </label>
            </Title>
            <Active>
              {active.map((p) => (
                <UserIconView
                  userId={p.userId}
                  user={p.user}
                  status={p.status}
                  small
                  tap={tap}
                  isOnline={p.isOnline}
                  createStatusHook={createStatusHook}
                  videoFrame={
                    videoFrame[p.userId]?.ts >= Date.now() - 3000
                      ? videoFrame[p.userId].frame
                      : undefined
                  }
                />
              ))}
            </Active>
          </>
        ) : null}
        {inactive.length > 0 ? (
          <>
            <Title>
              <label>
                {active.length ? 'Others' : 'Present'}{' '}
                {inactive.length > 1 ? `(${inactive.length})` : ''}
              </label>
            </Title>
            <Inactive>
              {inactive.map((p) => (
                <UserRow>
                  <UserListView
                    userId={p.userId}
                    user={p.user}
                    status={p.status}
                    small
                    tap={tap}
                    isOnline={p.isOnline}
                    createStatusHook={createStatusHook}
                  />
                </UserRow>
              ))}
            </Inactive>
          </>
        ) : null}
        <Dock dropdownOpen={isDropdownOpen} focus={dockFocus?.region}>
          <StatusRoot ref={dockEl}>
            <StatusControls
              localStatus={trayState.localStatus}
              localUser={trayState.localUser}
              message={statusMessage}
              setMessage={setStatusMessage}
              resetMessage={() =>
                setStatusMessage(trayState.localStatus?.message || '')
              }
              saveMessage={saveStatusMessage}
              emojiResults={
                emojiSearch.results.length > 0
                  ? emojiSearch.results
                  : commonEmojis
              }
              emojiQuery={emojiSearch.query}
              setEmojiQuery={emojiSearch.setQuery}
              selectEmoji={saveEmojiSelection}
              focus={dockFocus}
              handleBlur={() => setDockFocus(undefined)}
              setFocusRegion={(region: DockFocusRegion) =>
                setDockFocus({ ...dockFocus, region })
              }
              setPresence={savePresenceMode}
              isDropdownOpen={isDropdownOpen}
              setDropdownOpen={setIsDropdownOpen}
              setFocusedEmojiId={(id: string | undefined) => {
                setDockFocus((current) => ({
                  // ts-ignore
                  ...current,
                  emoji: {
                    id,
                  },
                }))
              }}
              setFocusAway={() => setDockFocus(undefined)}
              reverseOrder
              tray
            />
          </StatusRoot>
          <TrayCallControls
            isActive={
              trayState.localStatus?.camera_on || trayState.localStatus?.mic_on
            }
            cameraOn={trayState.localStatus?.camera_on || false}
            micOn={trayState.localStatus?.mic_on || false}
            speakerOn={trayState.localStatus?.speaker_on || false}
            toggleMic={() =>
              sendToggleCommand('setMicOn', !trayState.localStatus?.mic_on)
            }
            toggleCamera={() =>
              sendToggleCommand(
                'setCameraOn',
                !trayState.localStatus?.camera_on
              )
            }
            toggleSpeaker={() =>
              sendToggleCommand(
                'setSpeakerOn',
                !trayState.localStatus?.speaker_on
              )
            }
            joinCall={() => messageMainWindow({ joinCall: true })}
            leaveCall={() => messageMainWindow({ leaveCall: true })}
          />
        </Dock>
      </Container>
    </Tooltip.Provider>
  )

  function onMessage(event: Event, parsed: ElectronMessage) {
    log.info('Received', parsed)

    if (parsed.payload.provideState) {
      setTrayState(parsed.payload.provideState.state)
      return
    }

    if (parsed.payload.sendVideoFrame) {
      const userId = parsed.payload.sendVideoFrame?.userId
      if (!userId) return

      return setVideoFrame((videoFrames) => {
        return {
          ...videoFrames,
          [userId]: {
            frame: parsed.payload.sendVideoFrame?.base64Image,
            ts: Date.now(),
          },
        }
      })
    }

    log.error('')
  }

  function showMainWindow() {
    messageWindowManager({ showMainWindow: true })
  }

  function hideTrayWindow() {
    messageWindowManager({ hideTrayWindow: true })
  }

  function saveStatusMessage() {
    messageMainWindow({
      saveStatusMessage: {
        message: statusMessage,
      },
    })
  }

  function saveEmojiSelection(emoji: string | undefined) {
    messageMainWindow({
      saveStatusEmoji: {
        emoji,
      },
    })
  }

  function savePresenceMode(presenceStatus: PresenceStatus) {
    messageMainWindow({
      savePresenceStatus: {
        status: presenceStatus,
      },
    })
  }

  function sendToggleCommand(cmd: string, value: boolean) {
    messageMainWindow({
      [cmd]: {
        on: value,
      },
    })
  }

  function tap(userId: string) {
    messageMainWindow({
      tap: {
        userId,
      },
    })
  }

  function createStatusHook(targetUserId: string) {
    messageMainWindow({
      createStatusHook: {
        targetUserId,
      },
    })
  }

  function moveFocus(shiftBy: number) {
    return () => {
      if (!dockFocus) return

      const order = [
        DockFocusRegion.Status,
        DockFocusRegion.EmojiSearch,
        DockFocusRegion.Message,
      ]

      const ind = order.indexOf(dockFocus?.region)
      let next = ind + shiftBy
      if (next === -1) {
        next = 0
      } else if (next === order.length) {
        next = order.length - 1
      }

      setDockFocus((focus) => ({ ...focus, region: order[next] }))
    }
  }

  function handleClick(event: MouseEvent) {
    if (
      event.target &&
      dockEl.current &&
      containerEl.current &&
      !dockEl.current.contains(event.target) &&
      containerEl.current.contains(event.target)
    ) {
      setDockFocus(undefined)
    }
  }
}

const globalStyles = globalCss({
  html: {
    color: '$electronTrayWindowFg',
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

const RoomHeader = styled('header', {
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
  fontSize: '$base',
})

const StatusRoot = styled('div', {
  width: '100%',
})

const Dock = styled('div', {
  position: 'absolute',
  zIndex: '$aboveBase',
  left: '15px',
  bottom: '15px',
  width: 'calc(100vw - 30px)',
  color: '$dockFg',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '$electronTrayDockBg',
  border: '1px solid $dockBorderColor',
  round: 'medium',
  overflow: 'hidden',
  boxShadow: 'rgb(0 0 0 / 20%) 0px 0 8px',
  variants: {
    hasFocus: {
      true: {},
    },
    focus: {
      [DockFocusRegion.Message]: {
        borderColor: '$dockFocusBorderColor',
        //background: '$dockFocusSectionBg',
      },
    },
    dropdownOpen: {
      true: {
        borderTopColor: 'transparent',
        borderTopRightRadius: '0',
        borderTopLeftRadius: '0',
      },
    },
  },
  [`& ${StatusControlsRoot}, & ${StatusControlsRoot} > section`]: {
    height: '40px',
  },
  [`& ${MessageSection}`]: {
    height: '100%',
  },
  [`& ${Button}`]: {
    background: 'transparent',
    border: '0',
    boxShadow: 'none',
  },
})

export const Active = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '4px',
  margin: '0 18px 0 18px',
})

const Inactive = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: '0 18px',
})

const UserRow = styled('div', {
  height: '48px',
})

const Empty = styled('div', {
  margin: '24px 12px',
  color: 'rgba(245, 250, 255, 0.3)',
  borderLeft: '2.5px solid rgba(255, 255, 255, 0.1)',
  paddingLeft: '10px',
  lineHeight: '1.4',
  label: true,
})

const Title = styled('div', {
  fontSize: '$small',
  fontWeight: '$semibold',
  textTransform: 'uppercase',
  padding: '0 14px',
  marginTop: '4px',
  height: '32px',
  label: true,
  vcenter: true,
  '& label': {
    borderRadius: '$small',
    padding: '4px 6px',
    background: 'rgba(40, 44, 51, 0.9)',
    color: 'rgba(245, 250, 255, 0.35)',
  },
})

ReactDOM.render(<ElectronTrayWindow />, document.getElementById('root'))
