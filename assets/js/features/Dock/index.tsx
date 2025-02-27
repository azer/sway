import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import { logger } from 'lib/log'

import {
  ConnectionState,
  setFocusAway,
  setFocusedEmojiId,
  setFocusRegion,
  setInternetConnectionStatus,
} from './slice'

import { useStatus } from 'features/Status/use-status'
import { MessageSection, DockSection, StatusControls } from './StatusControls'
import { useEmojiSearch } from 'features/Emoji/use-emoji-search'
import { DockFocusRegion } from './focus'
import { commonEmojis } from 'features/ElectronTrayWindow/selectors'
import { useHotkeys } from 'react-hotkeys-hook'
import { Mirror, MirrorRoot } from './Mirror'
import { findStatusModeByKey } from 'state/status'

interface Props {
  roomId: string
}

const log = logger('dock')

export function Dock(props: Props) {
  const dispatch = useDispatch()

  const status = useStatus()
  const emojiSearch = useEmojiSearch()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [localUser, localStatus, focus, isActive] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.status.getLocalStatus(state),
    selectors.dock.getFocus(state),
    selectors.status.isLocalUserActive(state),
  ])

  const [message, setMessage] = useState(localStatus?.message || '')

  /**/

  useHotkeys(
    'up',
    moveFocus(-1),
    {
      enabled: !!focus,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [focus]
  )

  useHotkeys(
    'down',
    moveFocus(1),
    {
      enabled: !!focus,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [focus]
  )

  useEffect(() => {
    if (!localUser) return

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [localUser?.id])

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, false)

    if (!isDropdownOpen) {
      emojiSearch.setQuery('')
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, false)
    }
  }, [isDropdownOpen, focus])

  useEffect(() => {
    if (localStatus?.message && localStatus?.message !== message) {
      log.info('Local status message changed:', localStatus?.message, message)
      setMessage(localStatus?.message)
    }
  }, [localStatus?.id])

  return (
    <>
      <Container
        ref={containerRef}
        isDropdownOpen={isDropdownOpen}
        hasFocus={!!focus}
        isActive={isActive}
        onClick={() => {
          if (!isDropdownOpen && !focus) {
            dispatch(setFocusRegion(DockFocusRegion.Message))
          } else if (focus && !isDropdownOpen) {
            setIsDropdownOpen(true)
          }
        }}
      >
        <MainDockRow focused={focus?.region === DockFocusRegion.Message}>
          {isActive ? (
            <Mirror />
          ) : (
            <Left>
              <Mirror />
            </Left>
          )}
          {isActive ? null : (
            <Right>
              <StatusControls
                localStatus={localStatus}
                localUser={localUser}
                message={message}
                setMessage={setMessage}
                resetMessage={() => setMessage(localStatus.message)}
                saveMessage={() => status.setMessage(message)}
                emojiResults={
                  emojiSearch.results.length > 0
                    ? emojiSearch.results
                    : commonEmojis
                }
                emojiQuery={emojiSearch.query}
                setEmojiQuery={emojiSearch.setQuery}
                selectEmoji={status.setEmoji}
                focus={focus}
                handleBlur={handleBlur}
                setFocusRegion={(region: DockFocusRegion) =>
                  dispatch(setFocusRegion(region))
                }
                setStatusMode={(p) => status.setMode(p)}
                isDropdownOpen={isDropdownOpen}
                setDropdownOpen={setIsDropdownOpen}
                setFocusedEmojiId={(id: string | undefined) =>
                  dispatch(setFocusedEmojiId(id))
                }
                setFocusAway={() => dispatch(setFocusAway())}
              />
              <StatusModeKey onClick={() => setIsDropdownOpen(true)}>
                {findStatusModeByKey(localStatus?.status)?.label}
              </StatusModeKey>
            </Right>
          )}
        </MainDockRow>
      </Container>
    </>
  )

  function handleOnline() {
    if (!localUser) return

    dispatch(
      setInternetConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connected,
      })
    )
  }

  function handleOffline() {
    if (!localUser) return

    dispatch(
      setInternetConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Disconnected,
      })
    )
  }

  function handleBlur(e: Event) {
    dispatch(setFocusAway())
  }

  function handleMouseDown(e: Event) {
    if (
      !isDropdownOpen &&
      !containerRef.current?.contains(e.target as Element) &&
      focus
    ) {
      dispatch(setFocusAway())
    }
  }

  function moveFocus(shiftBy: number) {
    return () => {
      if (!focus) return

      const order = [
        DockFocusRegion.Message,
        DockFocusRegion.EmojiSearch,
        DockFocusRegion.Status,
      ]

      const ind = order.indexOf(focus?.region)
      let next = ind + shiftBy
      if (next === -1) {
        next = 0
      } else if (next === order.length) {
        next = order.length - 1
      }

      dispatch(setFocusRegion(order[next]))
    }
  }
}

const Container = styled('nav', {
  display: 'flex',
  position: 'relative',
  overflow: 'hidden',
  width: '300px',
  color: '$dockFg',
  background: '$dockBg',
  border: '1px solid $dockBorderColor',
  round: 'large',
  boxShadow: 'rgb(0 0 0 / 20%) 0px 0 8px',
  variants: {
    hasFocus: {
      true: {
        background: '$dockFocusBg',
        borderColor: '$dockFocusBorderColor',
      },
    },
    isActive: {
      true: {
        width: 'auto',
        padding: '8px 0',
        [`& ${MirrorRoot}`]: {
          height: '100px',
        },
      },
    },
    isDropdownOpen: {
      true: {
        borderBottomColor: 'transparent',
        borderBottomRightRadius: '0',
        borderBottomLeftRadius: '0',
      },
    },
  },

  [`& ${MessageSection}`]: {
    background: 'transparent',
    border: '0',
  },
})

const MainDockRow = styled(DockSection, {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: '0',
  paddingBottom: '0',
})

const Left = styled('div', {
  padding: '8px 0',
  center: true,
  marginRight: '10px',
  paddingRight: '10px',
  position: 'relative',
  '&::after': {
    content: ' ',
    position: 'absolute',
    top: '16px',
    right: '0',
    width: '1px',
    height: 'calc(100% - 32px)',
    background: 'rgba(255, 255, 255, 0.08)',
  },
})

const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '40px',
})

const StatusModeKey = styled('div', {
  color: '$dockPresenceFg',
  fontSize: '$small',
  marginLeft: '26px',
  label: true,
})
