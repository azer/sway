import { styled } from 'themes'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import {
  findModeByStatus,
  PresenceMode,
  PresenceModes,
  PresenceStatus,
} from 'state/presence'
import selectors from 'selectors'
import React, { useEffect } from 'react'
import { Desc, Title } from './PushToTalkSettings'

import { useHotkeys } from 'react-hotkeys-hook'
import { Prop, Table, Value } from './CallSettingsPreview'
import { useUserSocket } from 'features/UserSocket'
import { useDispatch, useSelector } from 'state'
import { usePresence } from 'features/Presence/use-presence'
import { PresenceModeIcon } from 'components/PresenceModeIcon'

const dialogId = 'presence-settings'

export function usePresenceSettings() {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [  ])

  const { useRegister } = useCommandRegistry()
  const commandPalette = useCommandPalette()
  const { channel } = useUserSocket()
  const presence = usePresence()

  const [presenceMode] = useSelector((state) => [
    selectors.statuses.getLocalStatus(state).status,
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
    [presenceMode, channel]
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

      for (const p of PresenceModes) {
        register(p.label, () => presence.setMode(p.status), {
          prefix: 'Set your status as:',
          icon: p.icon,
          type: CommandType.AlterMode,
          shortcut: p.shortcut,
          keywords: p.keywords,
          when: presenceMode !== p.status,
        })
      }
    },
    [presenceMode, channel]
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
      selectedId: presenceMode,
      preview: (props: { selectedValue?: unknown }) => {
        const status = props.selectedValue as PresenceStatus
        const mode = findModeByStatus(status) as PresenceMode
        const label = mode?.label
        const desc = mode?.desc

        if (!mode) return

        return (
          <Preview>
            <IconWrapper>
              <PresenceModeIcon mode={props.selectedValue as PresenceStatus} />
            </IconWrapper>
            <Title>{label} Mode</Title>
            <Desc>{desc}</Desc>

            <Table>
              <Prop>Notifications</Prop>
              <Value off={!mode.notifications}>
                {!mode.notifications ? 'Off' : 'On'}
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

    for (const p of PresenceModes) {
      commands.push({
        id: p.status,
        value: p.status,
        icon: presenceMode === p.status ? 'checkmark' : '',
        name: p.label,
        callback: () => presence.setMode(p.status),
      })
    }

    return commands
  }
}

export const IconWrapper = styled('div', {
  maxWidth: '100px',
  margin: '0 auto',
  '& svg path': {
    filter: 'none !important',
  },
})

export const Preview = styled('div', {
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
