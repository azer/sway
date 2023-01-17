import React, { useEffect } from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import { useSelector, useDispatch } from 'state'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useUserSocket } from 'features/UserSocket'
import { PresenceModeIcon } from 'components/PresenceModeIcon'
import { CommandType, useCommandPalette } from 'features/CommandPalette'
import {
  setAudioInputOff,
  setAudioOutputOff,
  setVideoInputOff,
} from 'features/Settings/slice'
import { styled } from 'themes'
import { useHotkeys } from 'react-hotkeys-hook'
import { Entity, add, Status, Statuses, PresenceMode } from 'state/entities'
import { usePresenceSettings } from 'features/Settings/PresenceSettings'

interface Props {}

const log = logger('status/presence')

export function PresenceModeButton(props: Props) {
  const dispatch = useDispatch()

  const presenceSettings = usePresenceSettings()

  const [userId, roomId, presence] = useSelector((state) => [
    selectors.users.getSelf(state)?.id,
    selectors.rooms.getFocusedRoomId(state),
    selectors.presence.getSelfStatus(state),
  ])

  const { channel } = useUserSocket()

  return (
    <Button onClick={presenceSettings.open}>
      <Circle>
        <PresenceModeIcon
          active={presence.is_active}
          mode={presence.status}
          onClick={presenceSettings.open}
        />
      </Circle>
    </Button>
  )

  function switchPresenceStatus(newStatus: PresenceMode) {
    switch (newStatus) {
      case 'active':
        dispatch(setVideoInputOff(false))
        dispatch(setAudioInputOff(false))
        dispatch(setAudioOutputOff(false))
        break

      default:
        dispatch(setVideoInputOff(false))
        dispatch(setAudioInputOff(false))
        dispatch(setAudioOutputOff(false))
    }

    if (!channel) return

    channel.push('user:status', {
      presence_mode: newStatus,
      room_id: roomId,
    })
  }
}

const Button = styled('div', {
  height: '100%',
  aspectRatio: '1',
  center: true,
  round: 'large',
  space: { inner: [0, 2], gap: 1 },
  border: '1px solid rgba(255, 255, 255, 0.02)',
  boxShadow: 'rgb(0 0 0 / 5%) 0px 0px 4px',
  colors: {
    bg: '$dockButtonBg',
    fg: '$dockButtonFg',
  },
  '& svg': {
    width: '20px',
    height: '20px',
    margin: '0 auto',
    overflow: 'visible',
  },
  '&:hover': {
    background: '$dockButtonHoverBg',
    color: '$dockButtonHoverFg',
    borderColor: 'rgba(255, 255, 255, 0.03),',
  },
})

const Circle = styled('div', {
  background: 'rgba(255, 255, 255, 0.02)',
  width: '50px',
  height: '50px',
  round: 'circle',
  center: true,
})
