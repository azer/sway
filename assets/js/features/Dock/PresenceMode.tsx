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
} from './slice'
import { useCommandRegistry } from 'features/CommandRegistry'
import {
  useDaily,
  useDevices,
  useScreenShare,
} from '@daily-co/daily-react-hooks'
import { useUserSocket } from 'features/UserSocket'
import { PresenceModeIcon } from 'components/PresenceModeIcon'
import { CommandType, useCommandPalette } from 'features/CommandPalette'
import {
  setAudioInputOff,
  setAudioOutputOff,
  setVideoInputOff,
} from 'features/Settings/slice'
import { styled } from 'themes'

interface Props {}

const log = logger('status/presence')

export function PresenceModeButton(props: Props) {
  const dispatch = useDispatch()
  const { useRegister } = useCommandRegistry()

  const commandPalette = useCommandPalette()

  const callObject = useDaily()
  const { cameras, setCamera, microphones, setMicrophone } = useDevices()
  const { isSharingScreen, startScreenShare, stopScreenShare } =
    useScreenShare()

  const [userId, presence] = useSelector((state) => [
    selectors.users.getSelf(state)?.id,
    selectors.dock.getSelfPresenceStatus(state),
  ])

  const { channel } = useUserSocket()

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
          shortcut: ['⎇', 'f'],
          type: CommandType.AlterMode,
          when: presence?.mode !== PresenceMode.Focus,
        }
      )

      register(
        'Active mode',
        async () => {
          if (userId) {
            dispatch(setPresenceAsActive(userId))
            log.info('switching to active mode', cameras[0], microphones[0])

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
          shortcut: ['⎇', 'a'],
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
          shortcut: ['⎇', 'w'],
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
          shortcut: ['⎇', 'd'],
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
    <Button>
      <PresenceModeIcon mode={mode} onClick={openSettings} />
    </Button>
  )

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
