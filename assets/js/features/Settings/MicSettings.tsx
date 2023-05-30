import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import { logger } from 'lib/log'
import { setAudioInputDeviceId } from './slice'
import { useSelector, useDispatch } from 'state'
import { MicSettingsPreview } from './MicSettingsPreview'
import { useHotkeys } from 'react-hotkeys-hook'
import { useStatus } from 'features/Status/use-status'

const log = logger('settings/mic')
const dialogId = 'mic-settings'

export function useMicSettings() {
  const { useRegister } = useCommandRegistry()
  const dispatch = useDispatch()
  const [isOn, selectedDeviceId, allDevices] = useSelector((state) => [
    selectors.status.getLocalStatus(state).mic_on,
    selectors.settings.getAudioInputDeviceId(state),
    selectors.settings.allAudioInputDevices(state),
  ])

  const commandPalette = useCommandPalette()
  const presence = useStatus()

  useHotkeys(
    'meta+d',
    () => presence.setMedia({ mic: !isOn }),
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isOn, presence.setMedia]
  )

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, allDevices])

  useRegister(
    (register) => {
      register(`Microphone Settings`, open, {
        icon: 'mic',
        type: CommandType.Settings,
        palette: {
          modal: modalProps,
          commands: buildCommandList,
        },
      })

      register(`Mute microphone`, () => presence.setMedia({ mic: false }), {
        icon: 'mic-off',
        type: CommandType.Settings,
        shortcut: ['cmd', 'd'],
        when: isOn,
      })

      register(`Unmute microphone`, () => presence.setMedia({ mic: true }), {
        icon: 'mic',
        type: CommandType.Settings,
        shortcut: ['cmd', 'd'],
        when: !isOn,
      })

      for (const device of allDevices) {
        register(
          `Switch microphone to ${device.label}`,
          switchDevice(device.id),
          {
            icon: 'video',
            type: CommandType.Settings,
            when: selectedDeviceId !== device.id,
          }
        )
      }
    },
    [isOn, selectedDeviceId, allDevices]
  )

  return {
    commands: buildCommandList,
    modal: modalProps,
    open: () => {
      commandPalette.open(buildCommandList(), modalProps())
    },
  }

  function modalProps(parentModal?: () => ModalProps) {
    return {
      id: dialogId,
      title: 'Microphone Settings',
      icon: 'mic',
      placeholder: 'Tune your mic.',
      selectedId: selectedDeviceId,
      preview: (props: { selectedValue?: unknown }) => (
        <MicSettingsPreview deviceId={props.selectedValue as string} />
      ),
      search: (commands: Command[], query: string) =>
        performSearch(commands, query, { tolerant: true }),
      parentModal,
    }
  }

  function buildCommandList(): Command[] {
    const commands: Command[] = [
      {
        id: 'back',
        value: selectedDeviceId,
        icon: 'undo',
        name: 'Back',
        pin: true,
        callback: () => commandPalette.close(),
      },
    ]

    for (const device of allDevices) {
      commands.push({
        id: device.id,
        value: device.id,
        icon: selectedDeviceId == device.id ? 'checkmark' : '',
        name: device.label,
        callback: switchDevice(device.id),
      })
    }

    return commands
  }

  function switchDevice(deviceId: string) {
    return function () {
      dispatch(setAudioInputDeviceId(deviceId))
    }
  }
}
