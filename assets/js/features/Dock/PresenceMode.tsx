import React, { useEffect } from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import { useSelector, useDispatch } from 'state'
import {
  PresenceMode,
  setPresenceAsActive,
  setPresenceAsAway,
  setPresenceAsDoNotDisturb,
  setPresenceAsFocus,
  setPresenceMode,
} from './slice'
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

interface Props {}

const log = logger('status/presence')

export function PresenceModeButton(props: Props) {
  const dispatch = useDispatch()
  const { useRegister } = useCommandRegistry()

  const commandPalette = useCommandPalette()

  const [userId, presence] = useSelector((state) => [
    selectors.users.getSelf(state)?.id,
    selectors.dock.getSelfPresenceStatus(state),
  ])

  const { channel } = useUserSocket()

  useHotkeys(
    'alt+a',
    setModeAs(PresenceMode.Active),
    {
      preventDefault: true,
    },
    [userId]
  )

  useHotkeys(
    'alt+f',
    setModeAs(PresenceMode.Focus),
    {
      preventDefault: true,
    },
    [userId]
  )

  useHotkeys(
    'alt+w',
    setModeAs(PresenceMode.Away),
    {
      preventDefault: true,
    },
    [userId]
  )

  useHotkeys(
    'alt+d',
    setModeAs(PresenceMode.DoNotDisturb),
    {
      preventDefault: true,
    },
    [userId]
  )

  useEffect(() => {
    if (!channel) return
    channel.on(
      'user:status',
      (payload: { presence_mode: string; user_id: string }) => {
        switch (payload.presence_mode) {
          case 'focus':
            dispatch(setPresenceAsFocus(payload.user_id))
            break
          case 'dnd':
            dispatch(setPresenceAsDoNotDisturb(payload.user_id))
            break
          case 'away':
            dispatch(setPresenceAsAway(payload.user_id))
            break
          case 'active':
            dispatch(setPresenceAsActive(payload.user_id))
            break
        }
      }
    )
  }, [channel])

  useRegister(
    (register) => {
      register(
        'Focus mode',
        () => {
          if (userId) {
            dispatch(setPresenceAsFocus(userId))
            dispatch(setVideoInputOff(true))
            dispatch(setAudioInputOff(true))
            dispatch(setAudioOutputOff(true))
            channel?.push('user:status', { presence_mode: 'focus' })
          }
        },
        {
          icon: 'headphones',
          shortcut: ['alt', 'f'],
          type: CommandType.AlterMode,
          when: presence?.mode !== PresenceMode.Focus,
        }
      )

      register(
        'Active mode',
        async () => {
          if (userId) {
            dispatch(setPresenceAsActive(userId))
            //log.info('switching to active mode', cameras[0], microphones[0])

            //if (cameras.length > 0) setCamera(cameras[0].device.deviceId)
            /*if (microphones.length > 0)
              setMicrophone(microphones[0].device.deviceId)*/

            dispatch(setVideoInputOff(false))
            dispatch(setAudioInputOff(false))
            dispatch(setAudioOutputOff(false))

            log.info('Push to user:status channel', channel)
            channel?.push('user:status', { presence_mode: 'active' })
          }
        },
        {
          icon: 'phoneCall',
          shortcut: ['alt', 'a'],
          type: CommandType.AlterMode,
          when: presence?.mode !== PresenceMode.Active,
        }
      )

      register(
        'Away mode',
        () => {
          if (userId) {
            dispatch(setPresenceAsAway(userId))
            dispatch(setVideoInputOff(true))
            dispatch(setAudioInputOff(true))
            dispatch(setAudioOutputOff(true))
            channel?.push('user:status', { presence_mode: 'away' })
          }
        },
        {
          icon: 'coffee',
          shortcut: ['alt', 'w'],
          type: CommandType.AlterMode,
          when: presence?.mode !== PresenceMode.Away,
        }
      )

      register(
        'Do not disturb mode',
        () => {
          if (userId) {
            dispatch(setPresenceAsDoNotDisturb(userId))
            dispatch(setVideoInputOff(true))
            dispatch(setAudioInputOff(true))
            dispatch(setAudioOutputOff(true))
            channel?.push('user:status', { presence_mode: 'dnd' })
          }
        },
        {
          icon: 'night',
          shortcut: ['alt', 'd'],
          type: CommandType.AlterMode,
          when: presence?.mode !== PresenceMode.DoNotDisturb,
        }
      )
    },
    [userId, presence, channel]
  )

  const mode = presence?.mode || PresenceMode.Focus
  //const label = getLabel(mode)

  return (
    <Button onClick={openSettings}>
      <Circle>
        <PresenceModeIcon mode={mode} onClick={openSettings} />
      </Circle>
    </Button>
  )

  function setModeAs(mode: PresenceMode) {
    return function () {
      if (!userId) return
      dispatch(setPresenceMode({ userId, mode }))
    }
  }

  function openSettings() {
    if (!commandPalette.isOpen)
      commandPalette.open([], {
        id: 'cmdk',
        title: 'Bafa Command',
        icon: 'command',
        placeholder: '',
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
