import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import {
  findCommandById,
  performSearch,
  useCommandRegistry,
} from 'features/CommandRegistry'
import {
  DailyProvider,
  useAudioTrack,
  useDaily,
  useDevices,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import logger from 'lib/log'
import { setAudioInputDeviceId, setAudioInputOff } from './slice'
import { useSelector, useDispatch } from 'state'
import { MicSettingsPreview } from './MicSettingsPreview'

const log = logger('settings/mic')
const dialogId = 'mic-settings'

export function useMicSettings() {
  const { useRegister } = useCommandRegistry()
  const dispatch = useDispatch()
  const [isOff, selectedDeviceId, allDevices] = useSelector((state) => [
    selectors.settings.isAudioInputOff(state),
    selectors.settings.getAudioInputDeviceId(state),
    selectors.settings.allAudioInputDevices(state),
  ])

  const currentSelectedId = isOff ? 'off' : selectedDeviceId
  const commandPalette = useCommandPalette()

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, allDevices])

  useRegister(
    (register) => {
      register(`Microphone Settings`, open, {
        icon: 'video',
        type: CommandType.Settings,
        palette: {
          modal: modalProps,
          commands: buildCommandList,
        },
      })

      register(`Mute microphone`, turnMicOff, {
        icon: 'mic-off',
        type: CommandType.Settings,
        when: !isOff,
      })

      register(`Unmute microphone`, turnMicOff, {
        icon: 'mic',
        type: CommandType.Settings,
        when: isOff,
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
    [isOff, selectedDeviceId, allDevices]
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
      selectedId: currentSelectedId,
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
        value: currentSelectedId,
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
        icon: currentSelectedId == device.id ? 'checkmark' : '',
        name: device.label,
        callback: switchDevice(device.id),
      })
    }

    commands.push({
      id: 'off',
      value: 'off',
      icon: isOff ? 'checkmark' : '',
      name: 'Off',
      callback: turnMicOff,
    })

    return commands
  }

  function setDevice(id: string) {
    dispatch(setAudioInputDeviceId(id))
    dispatch(setAudioInputOff(false))
  }

  function turnMicOff() {
    dispatch(setAudioInputOff(true))
  }

  function turnMicOn() {
    dispatch(setAudioInputOff(false))
  }

  function switchDevice(deviceId: string) {
    return function () {
      dispatch(setAudioInputDeviceId(deviceId))
      dispatch(setAudioInputOff(false))
    }
  }
}
