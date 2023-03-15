import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import { logger } from 'lib/log'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { setParticipantStatus } from 'features/Call/slice'

import {
  ConnectionState,
  setFocusAway,
  setFocusedEmojiId,
  setFocusRegion,
  setInternetConnectionStatus,
} from './slice'

import {
  setAudioInputDeviceId,
  setAudioOutputDeviceId,
  setBackgroundBlur,
  setVideoInputDeviceId,
} from 'features/Settings/slice'
import { usePresence } from 'features/Presence/use-presence'
import { MessageSection, StatusControls } from './StatusControls'
import { useEmojiSearch } from 'features/Emoji/use-emoji-search'
import { DockFocusRegion } from './focus'
import { commonEmojis } from 'features/ElectronTrayWindow/selectors'
import { useHotkeys } from 'react-hotkeys-hook'
import { Mirror } from './Mirror'
import { DockSection } from './CallControls'
import { findModeByStatus } from 'state/presence'

interface Props {
  roomId: string
}

const log = logger('dock')

export function Dock(props: Props) {
  const dispatch = useDispatch()

  const localParticipant = useLocalParticipant()
  const presence = usePresence()
  const emojiSearch = useEmojiSearch()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [localUser, localStatus, focus] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.statuses.getLocalStatus(state),
    selectors.dock.getFocus(state),
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
    if (!localParticipant || !localUser) return

    log.info('Sync local participant props', localParticipant)

    dispatch(
      setParticipantStatus({
        userId: localUser.id,
        status: {
          dailyUserId: localParticipant.user_id,
          swayUserId: localUser.id,
          sessionId: localParticipant?.session_id,
          cameraOn: localParticipant.video,
          screenOn: localParticipant.screen,
          micOn: localParticipant.audio,
        },
      })
    )
  }, [localParticipant])

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

  return (
    <Container
      ref={containerRef}
      isDropdownOpen={isDropdownOpen}
      hasFocus={!!focus}
      onClick={() => {
        if (!isDropdownOpen && !focus) {
          dispatch(setFocusRegion(DockFocusRegion.Message))
        } else if (focus && !isDropdownOpen) {
          setIsDropdownOpen(true)
        }
      }}
    >
      <MainDockRow focused={focus?.region === DockFocusRegion.Message}>
        <Left>
          <Mirror />
        </Left>
        <Right>
          <StatusControls
            localStatus={localStatus}
            localUser={localUser}
            message={message}
            setMessage={setMessage}
            resetMessage={() => setMessage(localStatus.message)}
            saveMessage={() => presence.setMessage(message)}
            emojiResults={
              emojiSearch.results.length > 0
                ? emojiSearch.results
                : commonEmojis
            }
            emojiQuery={emojiSearch.query}
            setEmojiQuery={emojiSearch.setQuery}
            selectEmoji={presence.setEmoji}
            focus={focus}
            handleBlur={handleBlur}
            setFocusRegion={(region: DockFocusRegion) =>
              dispatch(setFocusRegion(region))
            }
            setPresence={(p) => presence.setMode(p)}
            isDropdownOpen={isDropdownOpen}
            setDropdownOpen={setIsDropdownOpen}
            setFocusedEmojiId={(id: string | undefined) =>
              dispatch(setFocusedEmojiId(id))
            }
            setFocusAway={() => dispatch(setFocusAway())}
          />
          <PresenceStatus onClick={() => setIsDropdownOpen(true)}>
            {findModeByStatus(localStatus?.status)?.label}
          </PresenceStatus>
        </Right>
      </MainDockRow>
    </Container>
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
    log.info('handle blur')
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

const PresenceStatus = styled('div', {
  color: '$dockPresenceFg',
  fontSize: '$small',
  marginLeft: '26px',
  label: true,
})
