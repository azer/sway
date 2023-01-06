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
import { Container, Label } from './Button'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useDaily, useDevices } from '@daily-co/daily-react-hooks'
import { useUserSocket } from 'features/UserSocket'
import { getLabel, PresenceModeIcon } from 'components/PresenceModeIcon'
import { CommandType, useCommandPalette } from 'features/CommandPalette'

interface Props {}

const log = logger('status/presence')

export function PresenceModeView(props: Props) {
  const dispatch = useDispatch()
  const { useRegister } = useCommandRegistry()

  const commandPalette = useCommandPalette()

  const callObject = useDaily()
  const { cameras, setCamera, microphones, setMicrophone } = useDevices()

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
            callObject?.setLocalVideo(false)
            callObject?.setLocalAudio(false)
            callObject?.setInputDevices({ audioSource: false })
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

            callObject?.setLocalVideo(true)
            callObject?.setLocalAudio(true)

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
            callObject?.setLocalVideo(false)
            callObject?.setLocalAudio(false)
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
            callObject?.setLocalVideo(false)
            callObject?.setLocalAudio(false)
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
    [userId, presence, callObject]
  )

  const mode = presence?.mode || PresenceMode.Focus
  //const label = getLabel(mode)

  return (
    <Container highlighted>
      <PresenceModeIcon mode={mode} onClick={openSettings} />
    </Container>
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
