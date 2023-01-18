import { styled } from 'themes'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import { PresenceMode } from 'state/entities'
import selectors from 'selectors'
import React, { useEffect } from 'react'
import { Desc, Title } from './PushToTalkSettings'
import {
  getDesc,
  getIcon,
  getLabel,
  PresenceModeIcon,
} from 'components/PresenceModeIcon'
import { useHotkeys } from 'react-hotkeys-hook'
import { Prop, Table, Value } from './CallSettingsPreview'
import { useUserSocket } from 'features/UserSocket'
import { useDispatch, useSelector } from 'state'
import { turnOnCamera } from './slice'

const dialogId = 'presence-settings'

export function usePresenceSettings() {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [  ])

  const { useRegister } = useCommandRegistry()
  const commandPalette = useCommandPalette()
  const { channel } = useUserSocket()

  const [roomId, mode] = useSelector((state) => [
    selectors.rooms.getFocusedRoomId(state),
    selectors.presence.getSelfStatus(state).status,
  ])

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, channel])

  useHotkeys(
    'alt+p',
    open,
    {
      preventDefault: true,
    },
    [mode, channel]
  )

  useRegister(
    (register) => {
      register('Presence Settings', open, {
        icon: 'livestream',
        type: CommandType.Settings,
        shortcut: ['alt', 'p'],
        palette: {
          modal: modalProps,
          commands: buildCommandList,
        },
      })

      register('Focus mode', () => setMode(PresenceMode.Focus), {
        icon: 'headphones',
        type: CommandType.AlterMode,
        shortcut: ['alt', 'f'],
        when: mode !== PresenceMode.Focus,
      })

      register('Social mode', () => setMode(PresenceMode.Social), {
        icon: 'eye',
        type: CommandType.AlterMode,
        when: mode !== PresenceMode.Social,
      })

      register('Solo mode', () => setMode(PresenceMode.Solo), {
        icon: 'incognito',
        type: CommandType.AlterMode,
        when: mode !== PresenceMode.Solo,
      })

      register('Zen mode', () => setMode(PresenceMode.Zen), {
        icon: 'sunrise',
        shortcut: ['alt', 'z'],
        type: CommandType.AlterMode,
        when: mode !== PresenceMode.Zen,
      })
    },
    [mode, channel]
  )

  return {
    modal: modalProps,
    commands: buildCommandList,
    open,
  }

  function open() {
    commandPalette.open(buildCommandList(), modalProps())
  }

  function modalProps(parentModal?: () => ModalProps) {
    return {
      id: dialogId,
      title: 'Presence Settings',
      icon: 'livestream',
      placeholder: 'Choose your flow.',
      selectedId: mode,
      preview: (props: { selectedValue?: unknown }) => {
        const mode = props.selectedValue as PresenceMode
        const label = getLabel(mode)
        const desc = getDesc(mode)
        const cameraOff = mode === PresenceMode.Social ? false : true

        return (
          <Preview>
            <IconWrapper>
              <PresenceModeIcon mode={props.selectedValue as PresenceMode} />
            </IconWrapper>
            <Title>{label} Mode</Title>
            <Desc>{desc}</Desc>

            <Table>
              <Prop>Camera</Prop>
              <Value off={cameraOff}>{cameraOff ? 'Off' : 'On'}</Value>
              <Prop>Notifications</Prop>
              <Value off={mode === PresenceMode.Zen}>
                {mode === PresenceMode.Zen ? 'Off' : 'On'}
              </Value>
              <Prop>Push-to-talk</Prop>
              <Value>
                {mode === PresenceMode.Solo ? 'Hold' : 'Press'} <kbd>Space</kbd>
              </Value>
            </Table>
          </Preview>
        )
      },
      search: (commands: Command[], query: string) =>
        performSearch(commands, query, { tolerant: true }),
      parentModal,
    }
  }

  function buildCommandList() {
    const commands: Command[] = [
      {
        id: 'back',
        //value: currentSelectedId,
        icon: 'undo',
        name: 'Back',
        pin: true,
      },
    ]

    commands.push({
      id: 'social',
      value: PresenceMode.Social,
      icon: mode === PresenceMode.Social ? 'checkmark' : '',
      name: 'Social',
      callback: switchMode(PresenceMode.Social),
    })

    commands.push({
      id: 'focus',
      value: PresenceMode.Focus,
      icon: mode === PresenceMode.Focus ? 'checkmark' : '',
      name: 'Focus',
      callback: switchMode(PresenceMode.Focus),
    })

    commands.push({
      id: 'zen',
      value: PresenceMode.Zen,
      icon: mode === PresenceMode.Zen ? 'checkmark' : '',
      name: 'Zen',
      callback: switchMode(PresenceMode.Zen),
    })

    commands.push({
      id: 'solo',
      value: PresenceMode.Solo,
      icon: mode === PresenceMode.Solo ? 'checkmark' : '',
      name: 'Solo',
      callback: switchMode(PresenceMode.Solo),
    })

    return commands
  }

  function switchMode(mode: PresenceMode) {
    return () => {
      setMode(mode)
    }
  }

  function setMode(newMode: PresenceMode) {
    if (newMode === PresenceMode.Social) {
      dispatch(turnOnCamera())
    }

    channel?.push('user:status', {
      presence_mode: newMode,
      room_id: roomId,
    })
  }
}

const IconWrapper = styled('div', {
  maxWidth: '100px',
  margin: '0 auto',
  '& svg path': {
    filter: 'none !important',
  },
})

const Preview = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  center: true,
  flexDirection: 'column',
  padding: '16px',
  [`& ${Table}`]: {
    width: '100%',
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '8px',
    gridTemplateColumns: '1fr 1fr',
  },
  [`& ${Value} kbd`]: {
    display: 'inline-block',
    font: '$sans',
    fontSize: '11px',
    padding: '4px 3px 4px 4px',
    textTransform: 'capitalize',
    round: 'small',
    background: '$commandPaletteSelectedShortcutBg',
    color: '$commandPaletteSelectedShortcutFg',
  },
  '& svg': {
    color: '$gray8',
  },
})
