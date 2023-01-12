import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import logger from 'lib/log'
import { KeyboardIcon } from 'components/Icon/Keyboard'
import { setPushToTalkVideo } from './slice'
import { useSelector, useDispatch } from 'state'

const log = logger('settings/push-to-talk')
const dialogId = 'push-to-talk-settings'

export function usePushToTalkSettings() {
  const dispatch = useDispatch()
  const [isOn] = useSelector((state) => [
    selectors.settings.isPushToTalkVideoOn(state),
  ])

  const commandPalette = useCommandPalette()
  const currentSelectedId = isOn ? 'audio' : 'audio-video'
  const { useRegister } = useCommandRegistry()

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [isOn, commandPalette.id, commandPalette.isOpen])

  useRegister((register) => {
    register(`Push-to-Talk Settings`, open, {
      icon: 'press',
      type: CommandType.Settings,
      palette: {
        modal: modalProps,
        commands: buildCommandList,
      },
    })
  }, [])

  return {
    commands: buildCommandList,
    modal: modalProps,
    open,
  }

  function open() {
    commandPalette.open(buildCommandList(), modalProps())
  }

  function modalProps(parentModal?: () => ModalProps) {
    return {
      id: dialogId,
      title: 'Push-to-Talk Settings',
      icon: 'press',
      placeholder: 'Ease into Chat',
      selectedId: currentSelectedId,
      preview: (props: { selectedValue?: unknown }) => {
        const video = props.selectedValue === 'audio-video'

        return (
          <Preview>
            <KeyboardIcon />
            <Title>Push-to-Talk</Title>
            <Desc>
              Turn on{' '}
              <strong>{video ? 'microphone and camera' : 'microphone'}</strong>{' '}
              when <kbd>space</kbd> is pressed.
            </Desc>
          </Preview>
        )
      },
      search: (commands: Command[], query: string) =>
        performSearch(commands, query, { tolerant: true }),
      parentModal,
    }
  }

  function buildCommandList(): Command[] {
    const commands: Command[] = [
      {
        id: 'back',
        value: currentSelectedId,
        icon: 'undo',
        name: 'Back',
        pin: true,
        callback: () => commandPalette.close(),
      },
    ]

    commands.push({
      id: 'audio',
      value: 'audio',
      icon: !isOn ? 'checkmark' : '',
      name: 'Microphone Only',
      callback: () => dispatch(setPushToTalkVideo(false)),
    })

    commands.push({
      id: 'audio-video',
      value: 'audio-video',
      icon: isOn ? 'checkmark' : '',
      name: 'Microphone and Camera',
      callback: () => dispatch(setPushToTalkVideo(true)),
    })

    return commands
  }
}

const Preview = styled('div', {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  padding: '16px',
  center: true,
  flexDirection: 'column',
  '& svg': {
    color: '$gray8',
  },
  '& svg .space': {
    fill: '$red',
  },
})

const Title = styled('h1', {
  fontSize: '$medium',
  fontWeight: '$medium',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '16px 0 8px 0',
})

const Desc = styled('h2', {
  width: '200px',
  fontSize: '$small',
  fontWeight: '$normal',
  textAlign: 'center',
  lineHeight: '1.7',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: '0',
  '& kbd': {
    font: '$sans',
    fontSize: '11px',
    padding: '4px 3px 4px 4px',
    textTransform: 'capitalize',
    round: 'small',
    background: '$commandPaletteSelectedShortcutBg',
    color: '$commandPaletteSelectedShortcutFg',
  },
})
